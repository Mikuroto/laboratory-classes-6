const { app, BrowserWindow } = require('electron');
const { exec } = require('child_process');
const http = require('http');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  checkServerAndLoadURL();
}

function checkServerAndLoadURL() {
  const req = http.get('http://localhost:3000', (res) => {
    if (res.statusCode === 200) {
      mainWindow.loadURL('http://localhost:3000');
    } else {
      setTimeout(checkServerAndLoadURL, 1000);
    }
  });

  req.on('error', (err) => {
    setTimeout(checkServerAndLoadURL, 1000);
  });
}

app.whenReady().then(() => {
  const expressServer = exec('npm start');

  expressServer.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  expressServer.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  expressServer.on('close', (code) => {
    console.log(`Express server process exited with code ${code}`);
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});