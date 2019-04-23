import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import Register from '@/components/Register'
import FileList from '@/components/FileList'
import Gallery from '@/components/Gallery'
import Home from '@/components/Home'
import AccessShareFile from '@/components/AccessShareFile'
import NotFound from '@/components/404'
import Verify from '@/components/Verify'
import Message from '@/components/Message'
import UserInfo from '@/components/UserInfo'
import { getToken } from '@/utils/auth'
import store from '../store'
import { GetInfo } from '@/api/user'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

Vue.use(Router)

const routes = [
  {
    path: '/login',
    name: 'Login',
    hidden: true,
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    hidden: true,
    component: Register
  },
  {
    path: '/404',
    component: NotFound,
    name: 'NotFound',
    hidden: true
  },
  {
    path: '/home/verify',
    component: Verify,
    name: 'Verify',
    hidden: true
  },
  {
    path: '/home/s/:shareId',
    component: AccessShareFile,
    name: 'AccessShareFile',
    hidden: true
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    children: [
      {
        path: 'fileList',
        name: 'fileList',
        meta: {
          title: '文件列表',
          icon: 'my-file'
        },
        component: FileList
      },
      {
        path: 'gallery',
        name: 'gallery',
        meta: {
          title: '相册',
          icon: 'my-gallery'
        },
        component: Gallery
      },
      {
        path: 'message',
        name: 'message',
        meta: {
          title: '我的消息',
          icon: 'envelop-o'
        },
        component: Message
      },
      {
        path: 'userInfo',
        name: 'userInfo',
        meta: {
          title: '用户信息',
          icon: 'user-o'
        },
        component: UserInfo
      }
    ]
  }
]

Vue.use(Router)

const router = new Router({
  routes
});

function browser (to) {
  const UA = navigator.userAgent;
  const ipad = !!(UA.match(/(iPad).*OS\s([\d_]+)/)),
    isIphone = !!(!ipad && UA.match(/(iPhone\sOS)\s([\d_]+)/)),
    isAndroid = !!(UA.match(/(Android)\s+([\d.]+)/)),
    isMobile = !!(isIphone || isAndroid)
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  const port = window.location.port
  const fullPath = to.fullPath
  const url = window.location.href
  if (isMobile) {
    if (url.indexOf('app') === -1) {
      if (fullPath.indexOf('/home/s') !== -1 || fullPath.indexOf('/home/verify') !== -1) {
        if (port) {
          location.href = `${protocol}//${hostname}:${port}/app/#${fullPath}`
        } else {
          location.href = `${protocol}//${hostname}/app/#${fullPath}`
        }
      } else {
        if (port) {
          location.href = `${protocol}//${hostname}:${port}/app`
        } else {
          location.href = `${protocol}//${hostname}/app`
        }
      }
      return false
    }
  } else {
    if (url.indexOf('app') !== -1) {
      if (fullPath.indexOf('/home/s') !== -1 || fullPath.indexOf('/home/verify') !== -1) {
        if (port) {
          location.href = `${protocol}//${hostname}:${port}/#${fullPath}`
        } else {
          location.href = `${protocol}//${hostname}/#${fullPath}`
        }
      } else {
        if (port) {
          location.href = `${protocol}//${hostname}:${port}`
        } else {
          location.href = `${protocol}//${hostname}`
        }
      }
      return false
    }
  }
  return true
}

const whiteList = ['/login', '/register', '/404', '/home/s', '/home/verify'] // 不重定向白名单

router.beforeEach((to, from, next) => {
  if (!browser(to)) {
    return
  }
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
