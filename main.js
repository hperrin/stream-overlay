const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const processArgv = hideBin(process.argv);
const argv = yargs(processArgv)
  .scriptName('stream-overlay')
  .usage('$0 [args] <url>')
  .positional('url', {
    describe: 'The URL of the page',
    default: './help.html',
  })
  .option('width', {
    alias: 'w',
    type: 'number',
    default: 450,
    description: 'Window width',
  })
  .option('height', {
    alias: 'h',
    type: 'number',
    default: 650,
    description: 'Window height',
  })
  .option('x', {
    type: 'number',
    default: -1,
    description: 'Window X position (-1 for centered)',
  })
  .option('y', {
    type: 'number',
    default: -1,
    description: 'Window Y position (-1 for centered)',
  })
  .help().argv;

const configured = processArgv.length > 0;
const url = argv._[0] || argv.url;
const { x, y, width, height } = argv;
const wins = [];

ipcMain.handle('requestUrl', (event) => {
  const { win, conf } = wins.find(
    (entry) => event.sender === entry.win.webContents
  );
  win.webContents.send('url', conf.url);
});
ipcMain.handle('requestClose', (event) => {
  const { win } = wins.find((entry) => event.sender === entry.win.webContents);
  win.close();
});

const createWindow = (conf) => {
  let { x, y, width, height } = conf;

  if (width < 45 || height < 30) {
    console.error("You're trying to make the window too small.");
    app.exit(1);
  }

  if (x === -1 || y === -1) {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: displayWidth, height: displayHeight } =
      primaryDisplay.workAreaSize;

    if (x === -1) {
      x = Math.max(0, Math.floor(displayWidth / 2 - width / 2));
    }
    if (y === -1) {
      y = Math.max(0, Math.floor(displayHeight / 2 - height / 2));
    }
  }

  let win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'assets', 'preload.js'),
    },
    icon: path.join(__dirname, 'assets', 'logo.png'),
    width,
    height,
    x,
    y,
    transparent: true,
    frame: false,
    movable: true,
    resizable: false,
  });

  win.loadFile('assets/page.html');

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    const i = wins.findIndex((entry) => entry.win === win);
    if (i > -1) {
      wins.splice(i);
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

  win.setAlwaysOnTop(true, 'screen-saver', 1);
  // win.webContents.openDevTools();

  wins.push({ win, conf });
};

const createWindows = () => {
  const configPath = path.resolve(__dirname, 'config.json');
  if (!configured && fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath));
      if (!Array.isArray(config)) {
        throw new Error('Config is not an array.');
      }
      if (config.length < 1) {
        throw new Error('Config array is empty.');
      }
      for (let entry of config) {
        const { url, height, width, x, y } = entry;
        if (
          typeof url !== 'string' ||
          typeof height !== 'number' ||
          typeof width !== 'number' ||
          typeof x !== 'number' ||
          typeof y !== 'number'
        ) {
          throw new Error(
            'Config entry is not valid: ' + JSON.stringify(entry)
          );
        }
        createWindow(entry);
      }
    } catch (e) {
      console.error('Error reading config file: ' + e);
      app.exit(1);
    }
  } else {
    createWindow({ url, x, y, width, height });
  }
};

app.whenReady().then(() => {
  createWindows();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindows();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
