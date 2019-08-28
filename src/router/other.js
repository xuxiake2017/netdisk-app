import Login from '@/views/Login'
import Register from '@/views/Register'
import AccessShareFile from '@/views/AccessShareFile'
import NotFound from '@/views/404'
import Verify from '@/views/Verify'
import ChatDialog from '@/views/chat/ChatDialog'
import AddFriend from '@/views/chat/AddFriend'

export default [
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
    path: '/chat/chatDialog',
    component: ChatDialog,
    name: 'chatDialog',
    hidden: true
  },
  {
    path: '/chat/addFriend',
    component: AddFriend,
    name: 'addFriend',
    hidden: true
  }
]
