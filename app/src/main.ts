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
  BaseWindow,
  WebContentsView,
} from 'electron';
import type { MenuItemConstructorOptions, MenuItem } from 'electron';

const pkg = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '..', 'package.json')).toString(),
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
    './help.html',
  )
  .option('-t, --title <title>', 'Window title', DEFAULT_TITLE)
  .addOption(
    new Option('-w, --width <width>', 'Window width')
      .default(DEFAULT_WIDTH)
      .argParser(parseFloat),
  )
  .addOption(
    new Option('-h, --height <height>', 'Window height')
      .default(DEFAULT_HEIGHT)
      .argParser(parseFloat),
  )
  .addOption(
    new Option('-x <x_coord>', 'Window X position (-1 for centered)')
      .default(DEFAULT_X, 'centered horizontally')
      .argParser(parseFloat),
  )
  .addOption(
    new Option('-y <y_coord>', 'Window Y position (-1 for centered)')
      .default(DEFAULT_Y, 'centered vertically')
      .argParser(parseFloat),
  )
  .addOption(
    new Option(
      '-o, --opacity <opacity>',
      "Window opacity (0 transparent to 1 opaque) (doesn't work on Linux)",
    )
      .default(DEFAULT_OPACITY)
      .argParser(parseFloat),
  )
  .addOption(
    new Option(
      '-f, --fullscreen',
      'Make the window full screen (width, height, x, and y are ignored)',
    ).default(DEFAULT_FULLSCREEN),
  )
  .argument(
    '[configfile]',
    'The path to a config file',
    path.resolve(__dirname, '..', 'config.json'),
  );

let configured = false;
program.on('option:url', () => (configured = true));
program.parse();
const configFile = program.args.length
  ? path.resolve(program.args[0])
  : path.resolve(__dirname, '..', 'config.json');
const options = program.opts();
const { url, x, y, width, height, title, opacity, fullscreen } = options;

// All the open overlay windows.
const wins: {
  conf: Conf;
  win: BaseWindow;
  handleView: WebContentsView;
  webView: WebContentsView;
}[] = [];
// Config editor window.
let configEditorWindow: BrowserWindow | undefined;
// Help window.
let helpWindow: BrowserWindow | undefined;

ipcMain.handle('requestConfig', (event) => {
  const entry = wins.find(
    (entry) => event.sender === entry.handleView.webContents,
  );
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
          {
            name: 'Stream Overlay Config',
            extensions: ['streamoverlay'],
          },
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
ipcMain.handle('requestLaunch', (_event, { config, mode }) => {
  for (let entry of config) {
    createOverlayWindow(entry, mode === 'clickable');
  }
});
ipcMain.handle('requestSave', (event, { config, filename, uid }) => {
  fs.writeFileSync(filename, JSON.stringify(config, null, 2));
  const basename = path.basename(filename);
  event.sender.send('saved', { filename, basename, uid });
});
ipcMain.handle('requestSaveAs', (event, { config, uid }) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    dialog
      .showSaveDialog(win, {
        title: 'Save Config File',
        properties: ['showOverwriteConfirmation'],
        defaultPath: 'Untitled.streamoverlay',
        filters: [
          {
            name: 'Stream Overlay Config',
            extensions: ['streamoverlay'],
          },
          { name: 'All Files', extensions: ['*'] },
        ],
      })
      .then((result) => {
        if (!result.canceled) {
          try {
            const filename = result.filePath;
            if (filename == null) {
              return;
            }
            fs.writeFileSync(filename, JSON.stringify(config, null, 2));
            const basename = path.basename(filename);
            event.sender.send('saved', { filename, basename, uid });
          } catch (e: any) {
            dialog.showErrorBox("Can't save config file.", e.message);
          }
        }
      })
      .catch((err) => {
        dialog.showErrorBox('Error saving file.', `${err}`);
      });
  }
});

const createOverlayWindow = (conf: Conf, interactable = false) => {
  let {
    x = DEFAULT_X,
    y = DEFAULT_Y,
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
    title = DEFAULT_TITLE,
    opacity = DEFAULT_OPACITY,
    fullscreen = DEFAULT_FULLSCREEN,
  } = conf;

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: displayWidth, height: displayHeight } =
    primaryDisplay.workAreaSize;

  const getPercent = (str: string) => {
    if (!str.match(/^\d+(?:\.\d+)?%$/)) {
      throw new Error('Invalid string.');
    }
    return parseFloat(str) / 100;
  };

  try {
    if (typeof width === 'string') {
      width = getPercent(width) * displayWidth;
    }
    if (typeof height === 'string') {
      height = getPercent(height) * displayHeight;
    }
  } catch (e: any) {
    dialog.showErrorBox('Invalid Config', e.message);
    return;
  }

  if (!fullscreen && (width < 45 || height < 30)) {
    dialog.showErrorBox(
      'Invalid Config',
      "You're trying to make the window too small. Min width is 45 and min height is 30.",
    );
    return;
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

  let win = new BaseWindow({
    maximizable: false,
    resizable: false,
    alwaysOnTop: !interactable,
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
  win.setBackgroundColor('rgba(0, 0, 0, 0.0)');

  const handleView = new WebContentsView({
    webPreferences: {
      preload: path.join(__dirname, '..', 'assets', 'preload.js'),
    },
  });
  win.contentView.addChildView(handleView);
  handleView.webContents.loadFile(
    path.join(__dirname, '..', 'assets', 'page.html'),
  );
  handleView.setBackgroundColor('rgba(0, 0, 0, 0.0)');
  handleView.setBounds({ x: 0, y: 0, width, height: 0 });
  handleView.setVisible(false);

  const webView = new WebContentsView({
    webPreferences: {
      sandbox: true,
      backgroundThrottling: false,
      safeDialogs: true,
      disableHtmlFullscreenWindowResize: true,
    },
  });
  win.contentView.addChildView(webView);
  webView.webContents.loadURL(conf.url);
  webView.setBackgroundColor('rgba(0, 0, 0, 0.0)');
  webView.setBounds({ x: 0, y: 0, width, height });

  const timer = setInterval(() => win.moveTop(), 1000);

  // Emitted when the window is closed.
  win.on('closed', () => {
    handleView.webContents.close();
    webView.webContents.close();

    clearInterval(timer);

    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    const i = wins.findIndex((entry) => entry.win === win);
    if (i > -1) {
      wins.splice(i, 1);
      makeTray();
    }

    // This is necessary until this is fixed: https://github.com/electron/electron/issues/46882
    app.emit('browser-window-blur');
  });

  const focus = () => {
    win.setIgnoreMouseEvents(false);
    win.setBackgroundColor('#ddd');

    handleView.setBounds({ x: 0, y: 0, width: width as number, height: 30 });
    handleView.setVisible(true);
    webView.setBounds({
      x: 0,
      y: 30,
      width: width as number,
      height: (height as number) - 30,
    });
  };
  win.on('focus', focus);

  if (win.isFocused()) {
    focus();
  }

  win.on('blur', () => {
    if (!interactable) {
      win.setIgnoreMouseEvents(true);
    }
    win.setBackgroundColor('rgba(0, 0, 0, 0.0)');
    handleView.setBounds({ x: 0, y: 0, width: width as number, height: 0 });
    handleView.setVisible(false);
    webView.setBounds({
      x: 0,
      y: 0,
      width: width as number,
      height: height as number,
    });

    // This is necessary until this is fixed: https://github.com/electron/electron/issues/46882
    app.emit('browser-window-blur');
  });

  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  if (!interactable) {
    win.setAlwaysOnTop(true, 'screen-saver', 1);
  }
  // win.webContents.openDevTools();

  wins.push({ win, conf, handleView, webView });
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
  // configEditorWindow.webContents.openDevTools();

  configEditorWindow.on('close', () => {
    configEditorWindow = undefined;
    makeTray();
  });

  configEditorWindow.on('closed', () => {
    // This is necessary until this is fixed: https://github.com/electron/electron/issues/46882
    app.emit('browser-window-blur');
  });

  configEditorWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  makeTray();
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

  helpWindow.on('closed', () => {
    // This is necessary until this is fixed: https://github.com/electron/electron/issues/46882
    app.emit('browser-window-blur');
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
    ...(configEditorWindow && wins.length
      ? ([
          { type: 'separator' },
          {
            label: 'Close All Overlays',
            click: () => {
              for (let entry of wins) {
                // Use setImmediate so the actions in the close event don't
                // prevent the rest from closing.
                setImmediate(() => {
                  entry.win.close();
                });
              }
            },
          },
        ] as (MenuItemConstructorOptions | MenuItem)[])
      : []),
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

const launchConfigFile = (filename: string) => {
  try {
    const userConfig = JSON.parse(fs.readFileSync(filename).toString());
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
            JSON.stringify(entry),
        );
      }
      config.push(entry);
    }
  } catch (e: any) {
    dialog.showErrorBox('Error reading config file.', e.message);
    app.exit(1);
  }
};

let tray: Tray | undefined;
let updateAvailable = false;

app.on('open-file', (_event, path) => {
  launchConfigFile(path);
});

app.whenReady().then(() => {
  const partition = 'persist:settings';
  const ses = session.fromPartition(partition);

  ses.protocol.interceptFileProtocol('file', (request, callback) => {
    let url = request.url.substring(7);
    if (process.platform === 'win32') {
      url = url.replace(/^\/\w+:/, () => '');
    }
    callback({ path: path.normalize(`${__dirname}/../${url}`) });
  });

  if (!configured) {
    if (fs.existsSync(configFile)) {
      launchConfigFile(configFile);
    } else {
      createConfigEditorWindow();
    }
  } else {
    config.push({
      title,
      url,
      x,
      y,
      width,
      height,
      opacity,
      fullscreen,
    });
  }

  createOverlayWindows();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createOverlayWindows();
  });

  app.on('browser-window-blur', () => {
    const windows = BaseWindow.getAllWindows();
    for (let window of windows) {
      if (!window.isMaximizable()) {
        // This is necessary until this is fixed: https://github.com/electron/electron/issues/46882
        window.setMaximizable(false);
      }
    }
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
    },
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
