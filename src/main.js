const { app, BrowserWindow, screen, Tray, Menu, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let tray = null;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const sidebarWidth = 350;
  const sidebarHeight = height * 0.94;

  mainWindow = new BrowserWindow({
    width: sidebarWidth,
    height: sidebarHeight,
    x: width - sidebarWidth,
    y: (height - sidebarHeight) / 2,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.platform === 'darwin') {
    mainWindow.setVibrancy('sidebar');
  }

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  // Use a simple icon or a colored dot for now
  // In a real app, we'd have a specific icon.png
  tray = new Tray(path.join(__dirname, 'renderer/assets/pilot.png')); 
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Sidekick HQ', enabled: false },
    { type: 'separator' },
    { label: 'Show/Hide Sidebar', click: () => toggleVisibility() },
    { 
      label: 'Themes', 
      submenu: [
        { label: 'Lofi-Dark', click: () => setTheme('lofi') },
        { label: 'Cyberpunk-Neon', click: () => setTheme('cyberpunk') },
        { label: 'Clean-Frost', click: () => setTheme('frost') },
      ]
    },
    { type: 'separator' },
    { label: 'Settings', click: () => {} },
    { label: 'Quit', click: () => app.quit() }
  ]);

  tray.setToolTip('Sidekick - Desktop AI');
  tray.setContextMenu(contextMenu);
}

function toggleVisibility() {
  if (!mainWindow) return;
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
  }
}

function setTheme(theme) {
  if (mainWindow) {
    mainWindow.webContents.send('switch-theme', theme);
  }
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC listeners
ipcMain.on('toggle-click-through', (event, ignore) => {
  if (mainWindow) {
    mainWindow.setIgnoreMouseEvents(ignore, { forward: true });
  }
});

ipcMain.on('switch-anchor', (event, side) => {
  if (!mainWindow) return;
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const sidebarWidth = mainWindow.getBounds().width;
  
  if (side === 'left') {
    mainWindow.setX(0);
  } else {
    mainWindow.setX(width - sidebarWidth);
  }
});
