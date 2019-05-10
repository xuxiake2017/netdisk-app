import Vue from 'vue'
import Vuex from 'vuex'
import FileList from './modules/fileList'
import User from './modules/user'
import Home from './modules/home'
import App from './modules/app'
import Chat from './modules/chat'
import Websocket from './modules/websocket'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    User,
    Home,
    FileList,
    App,
    Websocket,
    Chat
  }
})
