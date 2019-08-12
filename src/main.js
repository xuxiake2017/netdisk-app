// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import Vant from 'vant'
import 'vant/lib/index.css'
import './styles/iconfont.css'
import NetdiskConstant from '@/utils/NetdiskConstant'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import 'element-ui/lib/theme-chalk/display.css'
import './styles/layui/layui.css'
import './styles/layui/layim.css'
import './styles/layui/layer.css'
import './styles/iconfont'
import VueNativeSock from 'vue-native-websocket'
import {
  SOCKET_ONOPEN,
  SOCKET_ONCLOSE,
  SOCKET_ONERROR,
  SOCKET_ONMESSAGE,
  SOCKET_RECONNECT,
  SOCKET_RECONNECT_ERROR
} from './store/modules/websocket/mutation-types'

const mutations = {
  SOCKET_ONOPEN,
  SOCKET_ONCLOSE,
  SOCKET_ONERROR,
  SOCKET_ONMESSAGE,
  SOCKET_RECONNECT,
  SOCKET_RECONNECT_ERROR
}

Vue.use(Vant)
Vue.use(ElementUI)

Vue.prototype.$NetdiskConstant = NetdiskConstant
Vue.config.productionTip = false
Vue.use(VueNativeSock, `${process.env.BASE_API.replace(/http[s]?:/, str => { return str === 'http:' ? 'ws:' : 'wss:' })}/chat/message`, {
  // 引入vuex
  store: store,
  // 设置别名
  mutations: mutations,
  // 手动提交
  connectManually: true,
  // 自动重连
  reconnection: true, // (Boolean) whether to reconnect automatically (false)
  reconnectionAttempts: 1, // (Number) number of reconnection attempts before giving up (Infinity),
  reconnectionDelay: 3000 // (Number) how long to initially wait before attempting a new (1000)
})

/* eslint-disable no-new */
const vm = new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>',
  render: h => h(App)
})

vm.$connect()

// websocket心跳
window.setInterval(() => {
  if (store.getters.isConnected) {
    let messageBase = {}
    messageBase['type'] = 'HEARTBEAT'
    messageBase['content'] = 'heartbeat'
    messageBase['createTime'] = new Date().getTime()
    vm.$socket.send(JSON.stringify(messageBase))
  }
}, 10000)
