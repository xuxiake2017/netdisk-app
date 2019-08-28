import FileList from '@/views/FileList'
import Gallery from '@/views/Gallery'
import Home from '@/views/Home'
import Message from '@/views/Message'
import UserInfo from '@/views/UserInfo'
import Chat from '@/views/chat'
// import Mqtt from '@/views/Mqtt'

export default [
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
          title: '系统消息',
          icon: 'envelop-o'
        },
        component: Message
      },
      {
        path: 'chat',
        name: 'chat',
        meta: {
          title: '好友消息',
          icon: 'friends-o'
        },
        component: Chat
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
      // {
      //   path: 'mqtt',
      //   name: 'mqtt',
      //   meta: {
      //     title: 'mqtt测试',
      //     icon: 'smile-o'
      //   },
      //   component: Mqtt
      // }
    ]
  }
]
