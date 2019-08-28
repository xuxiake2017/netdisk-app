import Vue from 'vue'
import Router from 'vue-router'
import { getToken } from '@/utils/auth'
import store from '../store'
import { GetInfo } from '@/api/user'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import homeRoute from './home'
import otherRoute from './other'
// import { browser } from '../utils'

Vue.use(Router)

const routes = [
  ...homeRoute,
  ...otherRoute
]

Vue.use(Router)

const router = new Router({
  routes
})

const whiteList = ['/login', '/register', '/404', '/home/s', '/home/verify'] // 不重定向白名单

router.beforeEach((to, from, next) => {
  // if (!browser(to)) {
  //   return
  // }
  NProgress.start();
  const token = getToken()
  if (token) {
    if (to.path === '/login' || to.path === '/') {
      next({ path: '/fileList' })
    } else {
      const user = store.getters.user
      if (user) {
        next()
      } else {
        GetInfo().then(res => {
          store.commit('storeUser', res.data)
          res.data.friendList.forEach(item => {
            store.commit('setFriend', item)
          })
          next()
        }).catch(res => {
          store.commit('delUser')
          next({ path: '/login' })
        })
      }
    }
  } else {
    let flag = false
    whiteList.forEach((item, index) => {
      if (to.path.indexOf(item) !== -1) {
        flag = true
      }
    })
    if (flag) {
      next()
    } else {
      next({ path: '/login' })
    }
    // if (whiteList.indexOf(to.path) !== -1) {
    //   next()
    // } else {
    //   next({ path: '/login' })
    // }
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router
