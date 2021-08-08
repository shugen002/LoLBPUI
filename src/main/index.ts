import { app, BrowserWindow, Menu } from 'electron'
import { productName } from '../../package.json'

import { FileService } from './FileService'
import { LCUService } from './LCUService'
import { HttpService } from './HTTPService'
import { WebSocketServerService } from './WebSocketServerService'

import { DataDragonService } from './DataDragonService'

import { configure, getLogger, levels } from 'log4js'

configure({
  appenders: {
    console: {
      type: 'console'
    },
    file: {
      type: 'file',
      filename: 'logs/main.log'
    }
  },
  categories: {
    default: {
      appenders: ['console', 'file'],
      level: 'debug'
    }
  }
})
const logger = getLogger('main')
// set app name
app.name = productName
// to hide deprecation message
app.allowRendererProcessReuse = true

var services: any = {}

logger.info(new Date().toString() + '启动中')
services.FileService = new FileService()
logger.info('文件服务启动')
services.HttpService = new HttpService()
logger.info('Http服务器启动')
services.LCUService = new LCUService()
logger.info('Websocket服务器启动')
services.DataDragonService = new DataDragonService()
logger.info('LCU服务启动')
services.WebSocketServerService = new WebSocketServerService()

services.HttpService.registerRoutes('/lol', services.LCUService.assetProxy)

// disable electron warning
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'false'

const gotTheLock = app.requestSingleInstanceLock()
const isDev = process.env.NODE_ENV === 'development'
const isDebug = process.argv.includes('--debug')
let mainWindow

// only allow single instance of application
if (!isDev) {
  if (gotTheLock) {
    app.on('second-instance', () => {
      // Someone tried to run a second instance, we should focus our window.
      if (mainWindow && mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.focus()
    })
  } else {
    app.quit()
    process.exit(0)
  }
} else {
  // process.env.ELECTRON_ENABLE_LOGGING = true

  require('electron-debug')({
    showDevTools: false
  })
}

async function installDevTools() {
  let installExtension = require('electron-devtools-installer')
  installExtension.default(installExtension.VUEJS_DEVTOOLS).catch((err) => {
    console.log('Unable to install `vue-devtools`: \n', err)
  })
}

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    backgroundColor: '#fff',
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 540,
    // useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: false,
      webSecurity: false,
      devTools: isDev || isDebug
    },
    show: false
  })
  let weblogger = getLogger('WebContents')
  mainWindow.webContents.on('console-message', (e, level, message) => {
    weblogger.info(`[${level}] ${message}`)
  })

  // load root file/url
  if (isDev) {
    mainWindow.loadURL('http://localhost:9080')
  } else {
    mainWindow.loadFile(`${__dirname}/index.html`)
    // @ts-ignore
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
  }
  mainWindow.setMenu(null)
  // Show when loaded
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  mainWindow.on('closed', () => {
    console.log('\nApplication exiting...')
  })
}

app.on('ready', () => {
  createWindow()

  if (isDev) {
    installDevTools()
    mainWindow.webContents.openDevTools()
  }

  if (isDebug) {
    mainWindow.webContents.openDevTools()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    logger.info(new Date().toString() + '退出')
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
