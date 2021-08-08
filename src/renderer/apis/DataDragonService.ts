import { ipcRenderer } from 'electron'
export class DataDragonService extends EventTarget {
  constructor() {
    super()
    ipcRenderer.on('DataDragonService', (e, item: any, ...args: any[]) => {
      var event = new CustomEvent(item.event)
      Object.assign(event, item)
      this.dispatchEvent(event)
    })
  }
  invoke(action: string, ...args: any) {
    return ipcRenderer.invoke('DataDragonService', action, ...args)
  }

  async getChampions() {
    return this.invoke('getChampions')
  }

  async download(version: string) {
    return this.invoke('download', version)
  }

  async unpack(file) {
    return this.invoke('unpack', file)
  }
}
