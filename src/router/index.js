import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import FileList from '@/components/FileList'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Login',
      component: Login
    },
    {
      path: '/fileList',
      name: 'FileList',
      component: FileList
    }
  ]
})
