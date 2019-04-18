import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import FileList from '@/components/FileList'
import Gallery from '@/components/Gallery'
import Home from '@/components/Home'
import AccessShareFile from '@/components/AccessShareFile'
import NotFound from '@/components/404'
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
    path: '/404',
    component: NotFound,
    name: 'NotFound',
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
  const path = to.path
  const url = window.location.href
  if (isMobile) {
    if (url.indexOf('app') === -1) {
      if (path.indexOf('/home/s') !== -1) {
        if (port) {
          location.href = `${protocol}//${hostname}:${port}/app/#${path}`
        } else {
          location.href = `${protocol}//${hostname}/app/#${path}`
        }
      } else {
        if (port) {
          location.href = `${protocol}//${hostname}:${port}/app`
        } else {
          location.href = `${protocol}//${hostname}/app`
        }
      }
    }
  } else {
    if (url.indexOf('app') !== -1) {
      if (path.indexOf('/home/s') !== -1) {
        if (port) {
          location.href = `${protocol}//${hostname}:${port}/#${path}`
        } else {
          location.href = `${protocol}//${hostname}/#${path}`
        }
      } else {
        if (port) {
          location.href = `${protocol}//${hostname}:${port}`
        } else {
          location.href = `${protocol}//${hostname}`
        }
      }
    }
  }
}

const whiteList = ['/login', '/404', '/home/s'] // 不重定向白名单

router.beforeEach((to, from, next) => {
  browser(to)
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
