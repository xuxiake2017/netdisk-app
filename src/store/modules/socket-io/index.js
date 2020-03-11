import {
  SOCKET_CONNECT,
  SOCKET_CONNECT_ERR,
  SOCKET_DISCONNECT,
  SOCKET_ON_CHAT_MESSAGE,
  SOCKET_RECONNECT,
  SOCKET_RECONNECT_ERROR
} from './mutation-types'

export default {
  state: {
    socket: {
      isConnected: false,
      message: null,
      reconnectError: false,
      receive: {
        createTime: 1
      }
    }
  },
  mutations: {
    [SOCKET_CONNECT] (state, event) {
      console.log(SOCKET_CONNECT)
      state.socket.isConnected = true
    },
    [SOCKET_DISCONNECT] (state, event) {
      console.log(SOCKET_DISCONNECT)
      state.socket.isConnected = false
    },
    [SOCKET_CONNECT_ERR] (state, event) {
      console.log(SOCKET_CONNECT_ERR)
      console.error(state, event)
    },
    // default handler called for all methods
    [SOCKET_ON_CHAT_MESSAGE] (state, message) {
      console.log(SOCKET_ON_CHAT_MESSAGE)
      console.log(message)
      state.socket.message = message
      // state.socket.receive = JSON.parse(message.data)
      // console.log(state.socket.receive)
    },
    // mutations for reconnect methods
    [SOCKET_RECONNECT] (state, count) {
      console.log(SOCKET_RECONNECT)
      console.info(state, count)
    },
    [SOCKET_RECONNECT_ERROR] (state) {
      console.log(SOCKET_RECONNECT_ERROR)
      state.socket.reconnectError = true;
    }
  },
  getters: {
    'isConnected': state => state.socket.isConnected,
    'message': state => state.socket.message,
    'socket': state => state.socket,
    'receive': state => state.socket.receive
  }
}
