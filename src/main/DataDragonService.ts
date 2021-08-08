import { AxiosInstance } from 'axios'
import axios from 'axios'
import { getLogger } from 'log4js'
import { BrowserWindow, ipcMain, IpcMainEvent, IpcMainInvokeEvent } from 'electron'

const logger = getLogger('DataDragonService')

export class DataDragonService {
  static _instance: DataDragonService
  private axios: AxiosInstance

  public static get Instance(): DataDragonService {
    return this._instance || (this._instance = new this())
  }

  allowList: string[] = []
  ServiceName = 'DataDragonService'
  constructor() {
    DataDragonService._instance = this
    this.axios = axios.create({
      baseURL: 'http://ddragon.leagueoflegends.com/',
      headers: {
        'User-Agent': 'League of Legends Ban Pick UI'
      }
    })
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

  async getVersions(): Promise<any> {
    return this.axios.get('/api/versions.json', {
      responseType: 'json'
    })
  }

  async getChampion(version: string, locale: string, champData: string): Promise<any> {
    return this.axios.get(`/cdn/${version}/data/${locale}/champion.json`, {
      params: {
        champData
      },
      responseType: 'json'
    })
  }

  private emit(event: string, data: any) {
    BrowserWindow.getAllWindows().forEach((e) => {
      e.webContents.send(this.ServiceName, {
        event,
        data
      })
    })
  }
}
