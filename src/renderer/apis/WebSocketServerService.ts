import { ipcRenderer } from 'electron'
export class WebSocketServerService extends EventTarget {
  constructor() {
    super()
    ipcRenderer.on('WebSocketServerService', (e, item: any, ...args: any[]) => {
      var event = new CustomEvent(item.event)
      Object.assign(event, item)
      this.dispatchEvent(event)
    })
  }
  invoke(action: string, ...args: any) {
    return ipcRenderer.invoke('WebSocketServerService', action, ...args)
  }
  async broadcast(event: string, data: any) {
    return this.invoke('broadcast', event, data)
  }
  async setAutoResponse(action: string, data: any) {
    return this.invoke('setAutoResponse', action, data)
  }
}
