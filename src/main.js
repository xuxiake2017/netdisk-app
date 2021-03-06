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
import socket from './socket/index'

Vue.use(Vant)
Vue.use(ElementUI)

Vue.prototype.$NetdiskConstant = NetdiskConstant
Vue.config.productionTip = false

Vue.use(socket)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>',
  render: h => h(App)
})
