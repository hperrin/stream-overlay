import path from 'path';
import fs from 'fs';
import https from 'https';
import { program, Option } from 'commander';
import {
  app,
  session,
  dialog,
  ipcMain,
  screen,
  shell,
  BrowserWindow,
  Menu,
  Tray,
} from 'electron';

const pkg = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '..', 'package.json')).toString()
);

const DEV = process.env.NODE_ENV !== 'production';
const DEFAULT_TITLE = 'Stream Overlay';
const DEFAULT_WIDTH = 550;
const DEFAULT_HEIGHT = 650;
const DEFAULT_X = -1;
const DEFAULT_Y = -1;
const DEFAULT_OPACITY = 1;
const DEFAULT_FULLSCREEN = false;

type Conf = {
  url: string;
  title?: string;
  width?: number | string;
  height?: number | string;
  x?: number | string;
  y?: number | string;
  opacity?: number;
  fullscreen?: boolean;
};

program
  .name(pkg.name)
  .description(pkg.description)
  .version(pkg.version, '-v, --version', 'Print the current version');

program
  .option(
    '-u, --url <url>',
    'The URL of the page to open. This takes precedence over the passed config file',
    './help.html'
  )
  .option('-t, --title <title>', 'Window title', DEFAULT_TITLE)
  .addOption(
    new Option('-w, --width <width>', 'Window width')
      .default(DEFAULT_WIDTH)
      .argParser(parseFloat)
  )
  .addOption(
    new Option('-h, --height <height>', 'Window height')
      .default(DEFAULT_HEIGHT)
      .argParser(parseFloat)
  )
  .addOption(
    new Option('-x <x_coord>', 'Window X position (-1 for centered)')
      .default(DEFAULT_X, 'centered horizontally')
      .argParser(parseFloat)
  )
  .addOption(
    new Option('-y <y_coord>', 'Window Y position (-1 for centered)')
      .default(DEFAULT_Y, 'centered vertically')
      .argParser(parseFloat)
  )
  .addOption(
    new Option(
      '-o, --opacity <opacity>',
      "Window opacity (0 transparent to 1 opaque) (doesn't work on Linux)"
    )
      .default(DEFAULT_OPACITY)
      .argParser(parseFloat)
  )
  .addOption(
    new Option(
      '-f, --fullscreen',
      'Make the window full screen (width, height, x, and y are ignored)'
    ).default(DEFAULT_FULLSCREEN)
  )
  .argument(
    '[configfile]',
    'The path to a config file',
    path.resolve(__dirname, '..', 'config.json')
  );

let configured = false;
program.on('option:url', () => (configured = true));
program.parse();
const configFile = program.args.length
  ? path.resolve(program.args[0])
  : path.resolve(__dirname, '..', 'config.json');
const options = program.opts();
const { url, x, y, width, height, title, opacity, fullscreen } = options;

const wins: {
  conf: Conf;
  win: BrowserWindow;
}[] = [];
let configEditorWindow: BrowserWindow | undefined;
let helpWindow: BrowserWindow | undefined;

ipcMain.handle('requestConfig', (event) => {
  const entry = wins.find((entry) => event.sender === entry.win.webContents);
  if (entry) {
    const { conf } = entry;
    event.sender.send('config', conf);
  }
});
ipcMain.handle('requestClose', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  win?.close();
});
ipcMain.handle('requestFocusEvent', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win?.isFocused()) {
    event.sender.send('focus');
  }
});
ipcMain.handle('requestConfigFile', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    dialog
      .showOpenDialog(win, {
        title: 'Open Config File',
        properties: ['openFile'],
        filters: [
          { name: 'Stream Overlay Config', extensions: ['soconfig', 'json'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      })
      .then((result) => {
        if (!result.canceled) {
          try {
            const filename = result.filePaths[0];
            const basename = path.basename(filename);
            const json = fs.readFileSync(result.filePaths[0]).toString();
            const config = JSON.parse(json);

            event.sender.send('configFile', { filename, basename, config });
          } catch (e: any) {
            dialog.showErrorBox("Can't open config file.", e.message);
          }
        }
      })
      .catch((err) => {
        dialog.showErrorBox('Error opening file.', `${err}`);
      });
  }
});
ipcMain.handle('requestHelp', (_event) => {
  createHelpWindow();
});
ipcMain.handle('requestLaunch', (_event, data) => {
  for (let entry of data) {
    createOverlayWindow(entry);
  }
});

const createOverlayWindow = (conf: Conf) => {
  let {
    x = DEFAULT_X,
    y = DEFAULT_Y,
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
    title = DEFAULT_TITLE,
    opacity = DEFAULT_OPACITY,
    fullscreen = DEFAULT_FULLSCREEN,
  } = conf;

  if (!fullscreen && (width < 45 || height < 30)) {
    dialog.showErrorBox(
      'Invalid Config',
      "You're trying to make the window too small. Min width is 45 and min height is 30."
    );
    app.exit(1);
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: displayWidth, height: displayHeight } =
    primaryDisplay.workAreaSize;

  const getPercent = (str: string) => {
    if (!str.match(/^\d+(?:\.\d+)?%$/)) {
      dialog.showErrorBox(
        'Invalid Config',
        "You're trying to make the window too small. Min width is 45 and min height is 30."
      );
      app.exit(1);
      throw new Error();
    }
    return parseFloat(str) / 100;
  };

  if (typeof width === 'string') {
    width = getPercent(width) * displayWidth;
  }
  if (typeof height === 'string') {
    height = getPercent(height) * displayHeight;
  }
  if (x === -1) {
    x = Math.max(0, Math.floor(displayWidth / 2 - width / 2));
  }
  if (y === -1) {
    y = Math.max(0, Math.floor(displayHeight / 2 - height / 2));
  }
  if (typeof x === 'string') {
    x = getPercent(x) * displayWidth;
  }
  if (typeof y === 'string') {
    y = getPercent(y) * displayHeight;
  }

  let win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, '..', 'assets', 'preload.js'),
    },
    maximizable: false,
    resizable: false,
    alwaysOnTop: true,
    title,
    icon: path.join(__dirname, '..', 'assets', 'logo.png'),
    width,
    height,
    x,
    y,
    transparent: true,
    frame: false,
    movable: true,
    skipTaskbar: true,
    opacity,
    fullscreen,
  });

  const timer = setInterval(() => win.moveTop(), 1000);

  win.loadFile(path.join(__dirname, '..', 'assets', 'page.html'));

  // Emitted when the window is closed.
  win.on('closed', () => {
    clearInterval(timer);

    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    const i = wins.findIndex((entry) => entry.win === win);
    if (i > -1) {
      wins.splice(i, 1);
      makeTray();
    }
  });

  const focus = () => {
    win.setIgnoreMouseEvents(false);
    win.setBackgroundColor('#ddd');
    win.webContents.send('focus');
  };
  win.on('focus', focus);

  if (win.isFocused()) {
    focus();
  }

  win.on('blur', () => {
    win.setIgnoreMouseEvents(true);
    win.setBackgroundColor('rgba(0, 0, 0, 0.0)');
    win.webContents.send('blur');
  });

  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setAlwaysOnTop(true, 'screen-saver', 1);
  // win.webContents.openDevTools();

  wins.push({ win, conf });
  makeTray();
};

const createConfigEditorWindow = () => {
  if (configEditorWindow) {
    configEditorWindow.focus();
    return;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: displayWidth, height: displayHeight } =
    primaryDisplay.workAreaSize;

  configEditorWindow = new BrowserWindow({
    webPreferences: {
      partition: 'persist:settings',
      preload: path.join(__dirname, '..', 'assets', 'preload.js'),
    },
    title: 'Config Editor',
    icon: path.join(__dirname, '..', 'assets', 'logo.png'),
    width: Math.min(displayWidth * 0.8, 1024),
    height: Math.min(displayHeight * 0.8, 768),
    autoHideMenuBar: true,
  });

  // configEditorWindow.loadURL('http://localhost:3000');
  configEditorWindow.loadFile('/app/build/index.html');
  configEditorWindow.webContents.openDevTools();

  configEditorWindow.on('close', () => {
    configEditorWindow = undefined;
  });
};

const createHelpWindow = () => {
  if (helpWindow) {
    helpWindow.focus();
    return;
  }

  helpWindow = new BrowserWindow({
    webPreferences: {
      partition: 'persist:settings',
      preload: path.join(__dirname, '..', 'assets', 'preload.js'),
    },
    title: 'Help',
    icon: path.join(__dirname, '..', 'assets', 'logo.png'),
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    autoHideMenuBar: true,
  });

  helpWindow.loadFile('/app/build/help.html');

  helpWindow.on('close', () => {
    helpWindow = undefined;
  });

  helpWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
};

const makeTray = () => {
  if (!tray) {
    tray = new Tray(path.resolve(__dirname, '..', 'assets', 'logo.png'));
    tray.setToolTip("SylphWeed's Stream Overlay");
  }
  const contextMenu = Menu.buildFromTemplate([
    ...wins.map(({ conf, win }, index) => ({
      label: conf.title || 'Window ' + (index + 1),
      click: async () => {
        if (win) {
          win.focus();
        } else {
          createOverlayWindow(conf);
        }
      },
    })),
    { type: 'separator' },
    {
      label: 'Config Editor',
      click: () => {
        createConfigEditorWindow();
      },
    },
    {
      label: 'Help',
      click: () => {
        createHelpWindow();
      },
    },
    {
      label: 'Homepage' + (updateAvailable ? ' (Update Available)' : ''),
      click: async () => {
        const { shell } = require('electron');
        await shell.openExternal('https://github.com/hperrin/stream-overlay');
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: async () => {
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);
};

let config: Conf[] = [];

const createOverlayWindows = () => {
  for (let entry of config) {
    createOverlayWindow(entry);
  }
};

let tray: Tray | undefined;
let updateAvailable = false;

app.on('open-file', (event, path) => {});
app.whenReady().then(() => {
  const partition = 'persist:settings';
  const ses = session.fromPartition(partition);

  ses.protocol.interceptFileProtocol('file', (request, callback) => {
    const url = request.url.substring(7);
    callback({ path: path.normalize(`${__dirname}/../${url}`) });
  });

  if (!configured) {
    if (fs.existsSync(configFile)) {
      try {
        const userConfig = JSON.parse(fs.readFileSync(configFile).toString());
        if (!Array.isArray(userConfig)) {
          throw new Error('Config is not an array.');
        }
        if (userConfig.length < 1) {
          throw new Error('Config array is empty.');
        }
        for (let entry of userConfig) {
          const { url } = entry;
          if (typeof url !== 'string') {
            throw new Error(
              'Config entry is not valid (url is required): ' +
                JSON.stringify(entry)
            );
          }
          config.push(entry);
        }
      } catch (e: any) {
        dialog.showErrorBox('Error reading config file.', e.message);
        app.exit(1);
      }
    } else {
      createConfigEditorWindow();
    }
  } else {
    config.push({ title, url, x, y, width, height, opacity, fullscreen });
  }

  createOverlayWindows();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createOverlayWindows();
  });

  makeTray();
  const req = https.request(
    {
      hostname: 'github.com',
      port: 443,
      path: '/hperrin/stream-overlay/releases/latest',
      method: 'HEAD',
    },
    (res) => {
      if (
        res.statusCode !== 302 ||
        !res.headers.location?.endsWith('v' + pkg.version)
      ) {
        updateAvailable = true;
        makeTray();
      }
    }
  );

  req.on('error', (e) => {
    console.error('Update check error: ', e);
  });
  req.end();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
