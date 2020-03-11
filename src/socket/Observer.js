import io from 'socket.io-client';
import Emitter from './Emitter';
import store from '../store';
import { getToken } from '@/utils/auth'
import {
  SOCKET_CONNECT,
  SOCKET_CONNECT_ERR,
  SOCKET_DISCONNECT,
  SOCKET_ON_CHAT_MESSAGE,
  SOCKET_RECONNECT,
  SOCKET_RECONNECT_ERROR
} from '../store/modules/socket-io/mutation-types'

export default class {
  constructor (ip, port) {
    this.ip = ip
    this.port = port
    this.mutationTypes = {
      SOCKET_CONNECT,
      SOCKET_CONNECT_ERR,
      SOCKET_DISCONNECT,
      SOCKET_ON_CHAT_MESSAGE,
      SOCKET_RECONNECT,
      SOCKET_RECONNECT_ERROR
    }
    this.PUSH_EVENT = 'on_chat_message'
    this.events = [this.PUSH_EVENT, 'connect', 'connect_err', 'disconnect', 'reconnect', 'reconnect_err']
    this.onEvent()
  }

  onEvent () {
    const token = getToken()
    console.log('token', token)
    let opts = {}
    if (token) {
      opts.query = {
        'X-Token': token
      }
    }
    this.socketIo = io(`http://${this.ip}:${this.port}`, opts);
    this.events.forEach((eventType) => {
      this.socketIo.on(eventType, (event) => {
        const eventType_ = eventType.replace(/_/g, '');
        Emitter.emit(eventType_, event)
        this.passToStore('SOCKET_' + eventType, event)
      })
    })
  }

  passToStore (eventName, event) {
    let target = eventName.toUpperCase()
    target = this.mutationTypes[target] || target
    store.commit(target, event)
  }
}
