import { ipcRenderer } from 'electron'
export class FileService extends EventTarget {
  constructor() {
    super()
    ipcRenderer.on('FileService', (e, item: any, ...args: any[]) => {
      var event = new CustomEvent(item.event)
      Object.assign(event, item)
      this.dispatchEvent(event)
    })
  }
  invoke(action: string, ...args: any) {
    return ipcRenderer.invoke('FileService', action, ...args)
  }

  async verifyLoLPath(path: string) {
    return this.invoke('verifyLoLPath', path)
  }

  async readText(path: string) {
    return this.invoke('readText', path)
  }

  async writeText(path: string, text: string) {
    return this.invoke('writeText', path, text)
  }

  async watchFile(path: string) {
    return this.invoke('watchFile', path)
  }

  async unwatchFile(path: string) {
    return this.invoke('unwatchFile', path)
  }

  async copyFile(path: string) {
    return this.invoke('copyFile', path)
  }
  async parseLnk(path: string) {
    return this.invoke('parseLnk', path)
  }
}
