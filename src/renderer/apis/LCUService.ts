import { ipcRenderer } from 'electron'
export class LCUService extends EventTarget {
  ApiEvent: EventTarget
  constructor() {
    super()
    ipcRenderer.on('LCUService', (e, item: any, ...args: any[]) => {
      let event = new CustomEvent(item.event)
      Object.assign(event, item)
      this.dispatchEvent(event)
    })
    this.ApiEvent = new EventTarget()
    this.addEventListener('OnJsonApiEvent', (e: any) => {
      let event = new CustomEvent(e.data.uri)
      Object.assign(event, e.data)
      this.ApiEvent.dispatchEvent(event)
    })
  }

  invoke(action: string, ...args: any) {
    return ipcRenderer.invoke('LCUService', action, ...args)
  }

  async connect(host: string, port: string, password: string) {
    return this.invoke('connect', host, port, password)
  }

  async close() {
    return this.invoke('close')
  }

  async terminate() {
    return this.invoke('terminate')
  }

  async subscribe(topic: string) {
    return this.invoke('subscribe', topic)
  }

  async unsubscribe(topic: string) {
    return this.invoke('unsubscribe', topic)
  }

  async getSubscribeList() {
    return this.invoke('getSubscribeList')
  }

  async getState() {
    return this.invoke('getState')
  }
  async call(...args: any[]) {
    return this.invoke('call', ...args)
  }
}
