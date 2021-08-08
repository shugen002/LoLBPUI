import Vue from 'vue'
import App from './App.vue'
import { RemoteConnection } from './RemoteConnection'
import 'animate.css/animate.css'

Vue.config.productionTip = false

Vue.prototype.RemoteConnection = new RemoteConnection(`ws://${location.hostname}:8997/`)
Vue.prototype

new Vue({
  render: h => h(App)
}).$mount('#app')
