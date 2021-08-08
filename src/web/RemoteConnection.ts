import { v4 } from 'uuid'
export class RemoteConnection extends EventTarget {
  private url: string
  private connection: WebSocket | null = null
  private callmap: {
    [key: string]: {
      resolve: (value?: unknown) => void
      reject: (value?: unknown) => void
    }
  }
  interval: any

  constructor(url: string) {
    super()
    this.url = url
    this.callmap = {}
    this.connect()
    this.interval = setInterval(this.keepConnect.bind(this), 1000)
  }

  private keepConnect() {
    if (this.connection === null || this.connection.readyState >= WebSocket.CLOSING) {
      this.connect()
    }
  }
  private connect() {
    this.connection = new WebSocket(this.url)
    this.connection.addEventListener('open', () => {
      this.dispatchEvent(new CustomEvent('connected'))
    })
    this.connection.addEventListener('message', this.onMessage.bind(this))
    this.connection.addEventListener('close', this.onClose.bind(this))
    this.connection.addEventListener('error', (e) => {
      console.log(e)
    })
  }

  getState() {
    if (this.connection) {
      return this.connection.readyState
    } else {
      return WebSocket.CLOSED
    }
  }
  async call(name: string, ...args: never[]) {
    if (this.connection) {
      if (this.connection.readyState === WebSocket.OPEN) {
        const id = v4()
        return new Promise((resolve, reject) => {
          this.callmap[id] = {
            resolve,
            reject
          }
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.connection!.send(
            JSON.stringify({
              action: 'call',
              data: {
                name: name,
                args,
                id
              }
            })
          )
        })
      } else {
        throw -500
      }
    } else {
      throw -500
    }
  }

  private onMessage(event: MessageEvent) {
    const msg = JSON.parse(event.data.toString()) as RemoteMessage
    if (msg.action === 'callResponse') {
      if (this.callmap[msg.data.id]) {
        if (msg.data.code === 0) {
          this.callmap[msg.data.id].resolve(msg.data.data)
        } else {
          this.callmap[msg.data.id].reject(msg.data.code)
        }
        delete this.callmap[msg.data.id]
      }
    } else if (msg.action === 'event') {
      const customevent = new CustomEvent<any>(msg.event)
      Object.assign(customevent, msg)
      this.dispatchEvent(customevent)
    } else {
      console.log(msg)
    }
  }

  private onClose() {
    const keys = Object.keys(this.callmap)
    keys.forEach((e) => {
      this.callmap[e].reject(-500)
      delete this.callmap[e]
    })
  }
}
type RemoteMessage = RemoteMessageEvent | RemoteMessageCallResponse
interface RemoteMessageEvent {
  action: 'event'
  event: string
  data: any
}
interface RemoteMessageCallResponse {
  action: 'callResponse'
  data: {
    name: string
    id: string
    code: number
    data?: any
  }
}
