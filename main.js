/**
 * ----------------------------------------------------------------------------
 * FILE:        main.js
 * AUTHOR:      Bryce Schultz
 * DATE:        11/30/2024
 * DESCRIPTION:
 * This is the main process file for an Electron application. It initializes
 * the application, creates a browser window, and handles app lifecycle events.
 *
 * FEATURES:
 * - Launches a browser window with predefined dimensions.
 * - Loads an `index.html` file as the main UI.
 * - Supports macOS-specific behavior where app remains active after all windows close.
 * - Ensures only one window is open when reactivated.
 *
 * ----------------------------------------------------------------------------
 * USAGE:
 * Run the following command in the project directory:
 * ```sh
 * npm start
 * ```
 *
 * If the project is not yet initialized, install dependencies first:
 * ```sh
 * npm install
 * ```
 *
 * ----------------------------------------------------------------------------
 * REVISION HISTORY:
 *
 * ----------------------------------------------------------------------------
 */


const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 600,
    icon: path.join(__dirname, 'build/icon.png'), 
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})