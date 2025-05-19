const { app, BrowserWindow, Tray, Menu, screen } = require('electron/main');
const path = require('path');
const fs = require('fs');

let tray = null;
let win = null;

const createWindow = () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workArea;

  const windowWidth = 390;
  const windowHeight = 140;
  const windowOffset = 7;

  win = new BrowserWindow({
    title: 'RadioWebPlayer',
    width: windowWidth,
    height: windowHeight,
    x: width - windowWidth + windowOffset,
    y: height - windowHeight + windowOffset,
    resizable: false,
    maximizable: false,
    icon: path.join(__dirname, 'favicon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile('index.html');
  win.setMenu(null);
  win.setAlwaysOnTop(true);
  win.setSkipTaskbar(true);

  win.on('minimize', (event) => {
    event.preventDefault();
    win.hide();
  });
};

const createTray = () => {
  const iconPath = path.join(__dirname, 'favicon.ico');
  tray = new Tray(fs.existsSync(iconPath) ? iconPath : path.join(__dirname, 'default-icon.png'));

  // Carregar estações do arquivo JSON
  const stationsPath = path.join(__dirname, 'stations.json');
  let stations = [];
  if (fs.existsSync(stationsPath)) {
    stations = JSON.parse(fs.readFileSync(stationsPath, 'utf-8'));
  }

  // Criar menu de contexto com as estações
  const stationMenuItems = stations.map((station) => ({
    label: station.station_name,
    click: () => {
      // Enviar mensagem para o player no renderer process
      win.webContents.send('play-station', station.src);
    },
  }));

  const contextMenu = Menu.buildFromTemplate([
    ...stationMenuItems,
    { type: 'separator' },
    { label: 'Sair', click: () => app.quit() },
  ]);

  tray.setToolTip('RadioWebPlayer');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    win.show();
  });
};

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});