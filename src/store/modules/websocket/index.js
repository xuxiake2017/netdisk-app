import {
  SOCKET_ONOPEN,
  SOCKET_ONCLOSE,
  SOCKET_ONERROR,
  SOCKET_ONMESSAGE,
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
    [SOCKET_ONOPEN] (state, event) {
      console.log(SOCKET_ONOPEN)
      state.socket.isConnected = true
    },
    [SOCKET_ONCLOSE] (state, event) {
      console.log(SOCKET_ONCLOSE)
      state.socket.isConnected = false
    },
    [SOCKET_ONERROR] (state, event) {
      console.log(SOCKET_ONERROR)
      console.error(state, event)
    },
    // default handler called for all methods
    [SOCKET_ONMESSAGE] (state, message) {
      console.log(SOCKET_ONMESSAGE)
      state.socket.message = message
      state.socket.receive = JSON.parse(message.data)
      console.log(state.socket.receive)
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
    'socket': state => state.socket
  }
}
