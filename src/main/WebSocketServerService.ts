import { BrowserWindow, ipcMain, IpcMainEvent, IpcMainInvokeEvent } from 'electron'
import { Server } from 'ws'
import { IncomingMessage } from 'http'
import { getLogger } from 'log4js'

const logger = getLogger('WebSocketServerService')

export class WebSocketServerService {
  server: Server
  responseMap: {
    [key: string]: any
  }
  allowList = ['broadcast', 'setAutoResponse']
  ServiceName = 'WebSocketServerService'
  constructor() {
    this.onMessage = this.onMessage.bind(this)
    this.onAction = this.onAction.bind(this)
    this.onClientMessage = this.onClientMessage.bind(this)
    this.onNewClient = this.onNewClient.bind(this)
    ipcMain.on(this.ServiceName, this.onMessage)
    ipcMain.handle(this.ServiceName, this.onAction)
    this.server = new Server({
      port: 8997,
      host: '127.0.0.1'
    })
    this.responseMap = {}
    this.server.on('connection', this.onNewClient)
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

  broadcast(event: string, data: any) {
    var msg = JSON.stringify({
      action: 'event',
      event,
      data
    })
    this.server.clients.forEach((e) => {
      try {
        e.send(msg)
      } catch (error) {
        logger.error('广播时发生错误', e)
      }
    })
    return true
  }
  async setAutoResponse(action: string, data: any) {
    this.responseMap[action] = data
    return true
  }

  private onClientMessage(socket: WebSocket, data: any) {
    try {
      let msg = JSON.parse(data) as RemoteMessage
      if (msg.action === 'call') {
        if (this.responseMap[msg.data.name]) {
          socket.send(
            JSON.stringify({
              action: 'callResponse',
              data: {
                name: msg.data.name,
                id: msg.data.id,
                code: 0,
                data: this.responseMap[msg.data.name]
              }
            })
          )
        } else {
          socket.send(
            JSON.stringify({
              action: 'callResponse',
              data: {
                name: msg.data.name,
                id: msg.data.id,
                code: -404
              }
            })
          )
        }
      }
    } catch (error) {
      console.log(error)
    }
  }
  private onNewClient(socket: WebSocket, request: IncomingMessage) {
    this.emit('newClient', { a: 1 })
    socket.addEventListener('message', (event) => {
      this.onClientMessage(socket, event.data)
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

interface RemoteMessage {
  action: 'call'
  data: RemoteCallData
}
interface RemoteCallData {
  name: string
  args: any[]
  id: string
}
