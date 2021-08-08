import { BrowserWindow, ipcMain, IpcMainEvent, IpcMainInvokeEvent } from 'electron'
import WebSocket from 'ws'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { getLogger } from 'log4js'
import Router, { RouterContext } from '@koa/router'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const MESSAGE_TYPES = {
  WELCOME: 0,
  PREFIX: 1,
  CALL: 2,
  CALLRESULT: 3,
  CALLERROR: 4,
  SUBSCRIBE: 5,
  UNSUBSCRIBE: 6,
  PUBLISH: 7,
  EVENT: 8
}

const logger = getLogger('LCUService')
export class LCUService {
  private ServiceName = 'LCUService'
  private connection: null | WebSocket = null
  private subscribeList: string[] = ['OnJsonApiEvent']
  private allowList = ['connect', 'close', 'terminate', 'send', 'getState', 'call']
  host: string = ''
  port: string = ''
  password: string = ''
  assetProxy: any

  constructor() {
    this.onMessage = this.onMessage.bind(this)
    this.onAction = this.onAction.bind(this)
    this._onMessage = this._onMessage.bind(this)
    ipcMain.on(this.ServiceName, this.onMessage)
    ipcMain.handle(this.ServiceName, this.onAction)
    let router: Router = new Router()
    router.get('/champion/:id', this.getChampionAsset.bind(this))
    router.get('/spell/:file', this.getSpellAsset.bind(this))
    this.assetProxy = router
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

  connect(host: string, port: string, password: string) {
    this.host = host
    this.port = port
    this.password = password
    this.close()
    this.connection = new WebSocket(`wss://riot:${password}@${host}:${port}/`, 'wamp')
    let self = this
    this.connection.on('message', function (e) {
      if (self.connection === this) {
        self._onMessage(e.toString())
      }
    })
    this.connection.on('open', function () {
      if (self.connection === this) {
        self.emit('open', {})
        logger.info('已连接')
      }
    })
    this.connection.on('close', function () {
      if (self.connection === this) {
        self.emit('close', {})
        logger.info('已关闭')
      }
    })
    this.connection.on('error', function (e) {
      if (self.connection === this) {
        logger.info('链接发生错误', e)
        self.emit('error', {
          error: e.message
        })
      }
    })
  }
  close() {
    if (this.connection) {
      this.connection.close()
      this.connection = null
    }
  }
  terminate() {
    if (this.connection) {
      this.connection.terminate()
      this.connection = null
    }
  }

  getState() {
    if (this.connection) {
      return this.connection.readyState
    } else {
      return WebSocket.CLOSED
    }
  }

  send(type: number, message: any) {
    this.connection!.send(JSON.stringify([type, message]))
  }

  subscribe() {
    if (this.connection) {
      if (this.subscribeList.length > 0) {
        this.subscribeList.forEach((topic) => {
          this.send(MESSAGE_TYPES.SUBSCRIBE, topic)
        })
      }
    }
  }

  async call(path: string) {
    try {
      return (await axios.get(`https://riot:${this.password}@${this.host}:${this.port}/${path}`)).data
    } catch (error) {
      throw error
    }
  }

  _onMessage(message: string) {
    const [type, ...data] = JSON.parse(message)

    switch (type) {
      case MESSAGE_TYPES.WELCOME:
        logger.info('收到欢迎信息 ' + JSON.stringify(data))
        this.subscribe()
        this.emit('welcome', {})
        break
      case MESSAGE_TYPES.CALLRESULT:
        console.log('未知请求结果', data)
        break
      case MESSAGE_TYPES.CALLERROR:
        console.log('未知请求错误', data)
        break
      case MESSAGE_TYPES.EVENT:
        const [topic, payload] = data
        this.emit(topic, payload)
        break
      default:
        console.log('未知类型：', [type, data])
        break
    }
  }
  private emit(event: string, data: any) {
    BrowserWindow.getAllWindows().forEach((e) => {
      e.webContents.send(this.ServiceName, {
        event,
        data
      })
    })
  }

  async getChampionAsset(ctx: RouterContext, next) {
    let res!: AxiosResponse<any>
    if (this.connection && this.connection.readyState === this.connection.OPEN) {
      let url = `https://riot:${this.password}@${this.host}:${this.port}/lol-game-data/assets/v1/champion-splashes/${ctx.params.id}/${ctx.params.id}000.jpg`
      try {
        res = await axios.get(url, {
          responseType: 'arraybuffer'
        })
      } catch (error) {
        logger.error(error.message, `- ${url}`)
      }
    }
    if (!res) {
      let url = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-splashes/${ctx.params.id}/${ctx.params.id}000.jpg`
      try {
        res = await axios.get(url, {
          responseType: 'arraybuffer'
        })
      } catch (error) {
        logger.error(error.message, `- ${url}`)
        ctx.redirect(url)
        return
      }
    }
    ctx.body = res.data
    ctx.set({
      'Content-Type': res.headers['content-type']
    })
  }

  async getSpellAsset(ctx: RouterContext, next) {
    let res!: AxiosResponse<any>
    if (this.connection && this.connection.readyState === this.connection.OPEN) {
      let url = `https://riot:${this.password}@${this.host}:${this.port}/lol-game-data/assets/DATA/Spells/Icons2D/${ctx.params.file}`
      try {
        res = await axios.get(url, {
          responseType: 'arraybuffer'
        })
      } catch (error) {
        logger.error(error.message, `- ${url}`)
      }
    }
    if (!res) {
      let url = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/DATA/Spells/Icons2D/${ctx.params.file}`
      try {
        res = await axios.get(url, {
          responseType: 'arraybuffer'
        })
      } catch (error) {
        logger.error(error.message, `- ${url}`)
        ctx.redirect(url)
        return
      }
    }
    ctx.body = res.data
    ctx.set({
      'Content-Type': res.headers['content-type']
    })
  }
}
