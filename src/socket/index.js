import Emitter from './Emitter'
import Observer from './Observer'
import { GetServer } from '@/api/friendMessage'

export default {
  install (Vue, ops) {
    // 获取可用Server IP、端口
    GetServer().then(res => {
      const data = res.data
      console.log(data)
      const ip = data['ip']
      const port = data['port']
      const observer = new Observer(ip, port)
      Vue.prototype.$socket = observer.socketIo;
    }).catch(res => {
      console.log(res)
    })
    const hasProxy = typeof Proxy !== 'undefined' && typeof Proxy === 'function' && /native code/.test(Proxy.toString())
    Vue.mixin({
      created () {
        let vm = this
        let sockets = this.$options['sockets']
        if (hasProxy) {
          this.$options.sockets = new Proxy({}, {
            set (target, key, value) {
              Emitter.addListener(key, value, vm)
              target[key] = value
              return true
            },
            deleteProperty (target, key) {
              Emitter.removeListener(key, vm.$options.sockets[key], vm)
              delete target.key
              return true
            }
          })
          if (sockets) {
            Object.keys(sockets).forEach((key) => {
              this.$options.sockets[key] = sockets[key]
            })
          }
        } else {
          Object.seal(this.$options.sockets)

          // if !hasProxy need addListener
          if (sockets) {
            Object.keys(sockets).forEach(key => {
              Emitter.addListener(key, sockets[key], vm)
            })
          }
        }
      },
      beforeDestroy () {
        if (hasProxy) {
          let sockets = this.$options['sockets']

          if (sockets) {
            Object.keys(sockets).forEach((key) => {
              delete this.$options.sockets[key]
            })
          }
        }
      }
    })
  }
}
