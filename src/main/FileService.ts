import { BrowserWindow, ipcMain, IpcMainEvent, IpcMainInvokeEvent } from 'electron'
import { extname, resolve as pathResolve } from 'path'
import { exec } from 'child_process'
import * as fs from 'fs'
import { getLogger } from 'log4js'
const { readdir, readFile, writeFile, copyFile, stat } = fs.promises
const logger = getLogger('FileService')
export class FileService {
  watching: {
    [key: string]: fs.FSWatcher
  } = {}
  allowList = ['verifyLoLPath', 'readText', 'writeText', 'watchFile', 'unwatchFile', 'copyFile', 'parseLnk']
  ServiceName = 'FileService'
  constructor() {
    this.onMessage = this.onMessage.bind(this)
    this.onAction = this.onAction.bind(this)
    ipcMain.on(this.ServiceName, this.onMessage)
    ipcMain.handle(this.ServiceName, this.onAction)
  }
  onMessage(event: IpcMainEvent, ...args: any[]) {}
  async onAction(event: IpcMainInvokeEvent, action: string, ...args: any[]) {
    if (this.allowList.indexOf(action) !== -1) {
      try {
        return {
          code: 0,
          // @ts-ignore
          data: await this[action](...args)
        }
      } catch (error) {
        logger.error(`执行请求时出错${action} ${JSON.stringify(args)}`)
        logger.error(error)
        return {
          code: -1,
          error: error.toString()
        }
      }
    }
    return {
      code: -404
    }
  }

  async verifyLoLPath(dirpath: string): Promise<Boolean> {
    console.log(dirpath)
    var filelist = await readdir(dirpath)
    var index = filelist.findIndex((v) => {
      return v === 'LeagueClient.exe'
    })
    return index !== -1
  }

  async readText(path: string): Promise<string> {
    var file = await readFile(path, 'utf8')
    return file
  }

  async writeText(filepath: string, text: string) {
    return await writeFile(filepath, text, 'utf8')
  }
  async watchFile(filepath: string) {
    this.watching[filepath] = fs.watch(filepath, (event, filename) => {
      this.emit('watch', { event, path: filepath, filename })
    })
  }

  async copyFile(filePath: string) {
    let filestat = await stat(filePath)
    if (filestat.isFile()) {
      let fileExtName = extname(filePath)
      let newFilename = (Math.random() * Math.pow(2, 32)).toString(16) + fileExtName
      await copyFile(filePath, pathResolve('./assets/data', newFilename))
      return '/data/' + newFilename
    } else {
      throw new Error('not a file')
    }
  }

  async unwatchFile(filepath: string) {
    if (this.watching[filepath]) {
      this.watching[filepath].close()
      delete this.watching[filepath]
      return true
    }
    return false
  }

  private emit(event: string, data: any) {
    BrowserWindow.getAllWindows().forEach((e) => {
      e.webContents.send(this.ServiceName, {
        event,
        data
      })
    })
  }
  destroy() {
    ipcMain.removeListener('fileService', this.onMessage)
    ipcMain.removeHandler('fileService')
  }
}
