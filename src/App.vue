<template>
  <div id="app">
    <router-view/>
    <van-popup v-model="friendMessagePopupShow" position="top" :overlay="false" class="friend-message-popup layui-layer-page layui-box layui-layim-min">
      <div id="" class="layui-layer-content" style="height: 40px;" @click="jumpToChat">
        <img id="layui-layim-min" :src="friendMessage.friendAvatar" style="cursor: move;">
        <span v-if="friendMessage.content">{{friendMessage.content}}</span>
        <span v-if="friendMessage.fileId">[文件]</span>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { UpdatePrincipal } from './api/user'
export default {
  name: 'App',
  data () {
    return {
      friendMessagePopupShow: false,
      friendMessage: {
        content: '',
        friendId: null,
        friendUsername: '',
        friendAvatar: '',
        fileId: null
      }
    }
  },
  created () {
    this.clientHeight = `${document.documentElement.clientHeight}`
    this.clientWidth = `${document.documentElement.clientWidth}`
    window.addEventListener('resize', () => {
      this.clientHeight = `${document.documentElement.clientHeight}`
      this.clientWidth = `${document.documentElement.clientWidth}`
    })
    document.addEventListener('deviceready', this.onDeviceReady, false)
    document.addEventListener('offline', this.offlineHandler, false)
    document.addEventListener('online', this.onlineHandler, false)
    // 开启websocket监听器
    this.$options.sockets.onmessage = this.onmessageHandler
  },
  computed: {
    ...mapGetters([
      'user'
    ]),
    clientHeight: {
      get () {
        return this.$store.getters.clientHeight
      },
      set (val) {
        this.$store.commit('setClientHeight', val)
      }
    },
    clientWidth: {
      get () {
        return this.$store.getters.clientWidth
      },
      set (val) {
        this.$store.commit('setClientWidth', val)
      }
    }
  },
  methods: {
    onDeviceReady () {
      console.log(window.device.cordova)
    },
    offlineHandler () {
      console.log('offlineHandler')
      this.$toast('网络连接断开!')
      this.networkStatus = false
    },
    onlineHandler () {
      console.log('onlineHandler')
      if (!this.networkStatus) {
        this.$toast('网络连接恢复!')
        this.networkStatus = true
        this.$connect()
      }
    },
    jumpToChat () {
      this.$router.push({
        name: 'chatDialog',
        params: {
          friendId: this.friendMessage.friendId
        }
      })
    },
    onmessageHandler (data) {
      const receive = JSON.parse(data.data)
      const messageContent = receive['content']
      this.$store.dispatch('ReceiveMessagesHandler', receive)
      if (receive.type === 'FRIEND') {
        this.friendMessage.friendId = messageContent.from
        this.friendMessage.friendUsername = messageContent.friendName
        this.friendMessage.friendAvatar = messageContent.friendAvatar
        this.friendMessage.content = messageContent.content
        this.friendMessage.fileId = messageContent.fileId
      } else if (receive.type === 'FRIEND_APPLY_FOR') {
        this.friendMessage.friendId = messageContent.applicant
        this.friendMessage.friendUsername = messageContent.applicantUsername
        this.friendMessage.friendAvatar = messageContent.applicantAvatar
        this.friendMessage.content = messageContent.postscript
      } else if (receive.type === 'SYSTEM') {
        if (receive.content === 'updatePrincipal') {
          this.updatePrincipal()
        }
        return
      }
      if (window.cordova) {
        window.cordova.plugins.notification.local.schedule({
          id: this.friendMessage.friendId,
          title: this.friendMessage.friendUsername,
          text: this.friendMessage.content ? this.friendMessage.content : '[文件]',
          icon: this.friendMessage.friendAvatar,
          foreground: true
        })
      } else {
        this.friendMessagePopupShow = true
        window.setTimeout(() => {
          this.friendMessagePopupShow = false
        }, 3000)
      }
    },
    updatePrincipal () {
      UpdatePrincipal().then(res => {
        this.$store.dispatch('getInfo')
      })
    }
  }
}
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    /*background-color: #f2f3f5;*/
  }
  .van-button--info {
    color: #fff;
    background-color: #1989fa;
    border: 1px solid #1989fa;
  }
  /*.home-nav-bar .van-nav-bar__left {*/
    /*left: 15px;*/
    /*top: 8px;*/
  /*}*/
  .icon {
    width: 1em;
    height: 1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
  }
  .friend-message-popup {
    text-align: left;
    width: 100%;
    height: 50px;
    box-shadow: 1px 1px 50px rgba(0,0,0,.3);
  }
  .layui-layer-content span {
    width: 250px;
  }
</style>
