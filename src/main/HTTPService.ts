import Koa from 'koa'
import KoaStatic from 'koa-static'
import Router from '@koa/router'
import path from 'path'
export class HttpService {
  static _instance: HttpService
  router: any
  static getInstance() {
    if (!this._instance) {
      this._instance = new HttpService()
    }
    return this._instance
  }
  app: Koa<Koa.DefaultState, Koa.DefaultContext>
  constructor() {
    this.app = new Koa()

    this.router = new Router({})
    this.app.use(
      KoaStatic(`${__dirname}/web`, {
        defer: true
      })
    )
    this.app.use(this.router.routes({}))

    this.app.listen(8998, '127.0.0.1')
  }
  registerRoutes(path, router) {
    this.router.use(path, router.routes())
  }
}
