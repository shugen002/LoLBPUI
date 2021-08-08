import Vue from 'vue'
import App from './App.vue'
import ViewUI from 'view-design'
import 'view-design/dist/styles/iview.css'
Vue.use(ViewUI)

const isDev = process.env.NODE_ENV === 'development'

Vue.config.devtools = isDev
Vue.config.performance = isDev
Vue.config.productionTip = isDev

// to avoid accesing electorn api from web app build
if (window && window.process && window.process.type === 'renderer') {
  window.API = require('./apis').API
}

// tslint:disable-next-line: no-unused-expression
new Vue({
  el: '#app',
  render: (h) => h(App)
})
