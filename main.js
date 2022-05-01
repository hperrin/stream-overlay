const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv))
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

const url = argv._[0] || argv.url;

const createWindow = () => {
  let { x, y, width, height } = argv;

  if (width < 30 || height < 30) {
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
      preload: path.join(__dirname, 'preload.js'),
    },
    width,
    height,
    x,
    y,
    transparent: true,
    frame: false,
    movable: true,
    resizable: false,
  });

  ipcMain.handle('requestUrl', () => win.webContents.send('url', url));
  ipcMain.handle('requestClose', () => win.close());

  win.loadFile('page.html');

  // Emitted when the window is closed.
  win.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  win.on('focus', function () {
    win.setIgnoreMouseEvents(false);
    win.setBackgroundColor('#ddd');
    win.webContents.send('focus');
  });

  win.on('blur', function () {
    win.setIgnoreMouseEvents(true);
    win.setBackgroundColor('rgba(0, 0, 0, 0.0)');
    win.webContents.send('blur');
  });

  win.setAlwaysOnTop(true, 'screen-saver', 1);
  // win.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
