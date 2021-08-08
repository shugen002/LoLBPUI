import { DataDragonService } from './DataDragonService'
import { FileService } from './FileService'
import { LCUService } from './LCUService'
import { WebSocketServerService } from './WebSocketServerService'

export const API = {
  FileService: new FileService(),
  LCUService: new LCUService(),
  WebSocketServerService: new WebSocketServerService(),
  DataDragonService: new DataDragonService()
}
