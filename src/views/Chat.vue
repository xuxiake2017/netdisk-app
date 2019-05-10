<template>
  <div class="chat">
    <!--消息列表-->
    <div class="chat-message-list" :style="{'height': `${clientHeight - 100}px`}" v-if="active === 0">
      <ul class="layui-layim-list layui-show">
        <li v-for="(item, index) in friendMessages" :key="index" @click="chatPopupOpen(item.friendId)">
          <img :src="friendMap.get(item.friendId).avatar"/>
          <span>{{friendMap.get(item.friendId).username}}</span>
          <p>{{item.content}}</p>
        </li>
      </ul>
    </div>
    <!--好友列表-->
    <div class="chat-frient-list" :style="{'height': `${clientHeight - 100}px`}" v-if="active === 1">
      <ul class="layui-layim-list layui-show">
        <li v-for="(item, index) in user.friendList" :key="index" @click="chatPopupOpen(item.friendId)">
          <img :src="item.avatar"/>
          <span>{{item.username}}</span>
          <p>{{item.signature}}</p>
        </li>
      </ul>
    </div>
    <!--通知-->
    <div :style="{'height': `${clientHeight - 100}px`}" v-if="active === 2" class="chat-frient-notify">
      <ul class="layim-msgbox">
        <li v-for="(item, index) in friendNotifies" :key="index" :class="{'layim-msgbox-system': item.content.respondent !== user.id}">
          <div v-if="item.content.respondent === user.id">
            <a>
              <img :src="item.content.applicantAvatar" class="layui-circle layim-msgbox-avatar">
            </a>
            <p class="layim-msgbox-user"><a>{{item.content.applicantUsername}}</a> <span>{{formatDateHuman(item.content.createTime)}}</span></p>
            <p class="layim-msgbox-content"> 申请添加你为好友</p>
            <p class="msgbox-postscript">附言: {{item.content.postscript}}</p>
            <p class="layim-msgbox-btn">
              <span v-if="item.content.verify === 0">
                <van-button size="small" type="primary" @click="agree(item)">同意</van-button>
                <van-button size="small" plain type="primary" @click="refuse(item)">拒绝</van-button>
              </span>
              <span v-if="item.content.verify === 1">
                已同意
              </span>
              <span v-if="item.content.verify === 2">
                已拒绝
              </span>
            </p>
          </div>
          <div v-if="item.content.applicant === user.id">
            <p v-if="item.content.verify === 0">
              <em>系统：</em>你向{{item.content.respondentUsername}}的好友申请待验证
              <span>{{formatDateHuman(item.content.createTime)}}</span>
            </p>
            <p v-else>
              <em>系统：</em>{{item.content.respondentUsername}} {{applyVerify[item.content.verify]}}了你的好友申请
              <span>{{formatDateHuman(item.content.createTime)}}</span>
            </p>
          </div>
        </li>
      </ul>
      <div class="layui-flow-more" v-if="friendNotifies.length === 0">
        <li class="layim-msgbox-tips">暂无更多新消息</li>
      </div>
    </div>
    <van-tabbar v-model="active">
      <van-tabbar-item icon="comment-o">消息</van-tabbar-item>
      <van-tabbar-item icon="friends-o">好友</van-tabbar-item>
      <van-tabbar-item icon="volume-o">通知</van-tabbar-item>
    </van-tabbar>
    <van-popup
      v-model="show"
      class="chat-popup"
      position="right">
      <van-nav-bar
        v-if="friend"
        :title="friend.username"
        left-text="返回"
        left-arrow
        @click-left="chatPopupClose">
      </van-nav-bar>
      <div class="layim-chat-main" :style="{'height': `${clientHeight - 130}px`}" ref="chatMain">
        <ul>
          <li v-for="(item, index) in messages" :key="index" :class="{ 'layim-chat-mine': item.mine }">
            <div class="layim-chat-user">
              <img :src="item.img">
              <div v-if="item.mine">
                <cite><i>{{item.date}}</i>{{item.user}}</cite>
              </div>
              <div v-else>
                <cite>{{item.user}}<i>{{item.date}}</i></cite>
              </div>
            </div>
            <div class="layim-chat-text">
              <chat-text :msg="item.msg"></chat-text>
            </div>
          </li>
        </ul>
      </div>
      <div class="layim-chat-footer" ref="chatFooter" :class="{'layim-chat-footer-keyboard-up': emojiKeyBoardShow, 'layim-chat-footer-keyboard-down': !emojiKeyBoardShow}">
        <!--<div class="layim-chat-textarea"><textarea></textarea></div>-->
        <div style="position: relative">
          <el-input
            v-model="messageCurrent"
            type="textarea"
            autosize
            @focus="onFocusHandler"
            @blur="onBlurHandler"
            placeholder="请输入内容">
          </el-input>
          <el-button type="text" class="message-send-button" @click="sendMessage">发送</el-button>
        </div>
        <div class="layui-unselect layim-chat-tool">
          <span class="layui-icon layim-tool-face" title="选择表情" @click="emojiKeyBoard"></span>
          <span class="layui-icon layim-tool-image" title="上传图片">
            <input type="file" name="file">
          </span>
          <span class="layui-icon layim-tool-image" title="发送文件" data-type="file">
            <input type="file" name="file">
          </span>
          <span class="layim-tool-log"><i class="layui-icon"></i>聊天记录</span>
        </div>
      </div>
      <emoji style="position: absolute; bottom: 0" v-if="emojiKeyBoardShow" @select="emojiSelect"></emoji>
    </van-popup>
  </div>
</template>

<script>
// import { SendMessage } from '../api/tuling'
import { GetFriendMessages } from '../api/friendMessage'
import { GetAllFriendNotify } from '../api/friendNotify'
import { FriendApplyForOption } from '../api/friendApplyFor'
import usermixin from '@/mixins/userInfo'
import util from '@/utils/util'
import { mapGetters } from 'vuex'
import Emoji from '../components/Emoji'
import ChatText from '../components/ChatText'
import { ParseToHtmlDecimal } from '../api/emoji'
export default {
  name: 'Chat',
  mixins: [usermixin],
  components: {
    Emoji,
    ChatText
  },
  data () {
    return {
      clientHeight: '',
      active: 0,
      show: false,
      messageCurrent: '',
      messages: [],
      friendMessages: [],
      friend: null,
      friendMessagesAll: [],
      friendNotifies: [],
      applyVerify: {
        1: '同意',
        2: '拒绝'
      },
      emojiKeyBoardShow: false
    }
  },
  methods: {
    chatPopupClose () {
      this.show = false
      this.emojiKeyBoardShow = false
      this.$refs.chatMain.style.height = `${this.clientHeight - 130}px`
      this.messageCurrent = ''
      this.getFriendMessages()
    },
    chatPopupOpen (friendId) {
      this.show = true
      this.friend = this.friendMap.get(friendId)
      this.messages = []
      this.friendMessagesAll.forEach(item => {
        let temp = {}
        if (this.friend.friendId === item.friendId) {
          if (item.from === this.user.id) {
            // 自己发送的消息
            temp.img = this.user.avatar
            temp.user = this.user.name
            temp.mine = true
          } else {
            // 好友发送的消息
            temp.img = this.friendMap.get(item.friendId).avatar
            temp.user = this.friendMap.get(item.friendId).username
            temp.mine = false
          }
          temp.date = util.formatDate.format(new Date(item.createTime), 'yyyy-MM-dd hh:mm:ss')
          temp.msg = item.content
          this.messages.push(temp)
        }
      })
    },
    sendMessage () {
      if (!this.messageCurrent) {
        return
      }
      if (!this.socket.isConnected) {
        this.$toast('websocket连接断开，请刷新页面!')
        return
      }
      let packet = {}
      packet['from'] = this.user.id
      packet['to'] = this.friend.friendId
      packet['content'] = this.messageCurrent
      packet['createTime'] = new Date().getTime()
      this.$socket.send(JSON.stringify(packet))
      let temp = {}
      temp.img = this.user.avatar
      temp.user = this.user.name
      temp.mine = true
      temp.date = util.formatDate.format(new Date(), 'yyyy-MM-dd hh:mm:ss')
      temp.msg = this.messageCurrent
      this.messages.push(temp)
      this.messageCurrent = ''
    },
    // 输入框获得焦点
    onFocusHandler () {
      console.log('onFocusHandler')
      this.emojiKeyBoardShow = false
      const $chatMain = this.$refs.chatMain
      $chatMain.style.height = `${this.clientHeight - 130}px`
    },
    // 输入框失去焦点
    onBlurHandler () {
      console.log('onBlurHandler')
    },
    getFriendMessages () {
      this.friendMessages = []
      GetFriendMessages().then(res => {
        let temp = new Map()
        this.friendMessagesAll = res.data
        this.friendMessagesAll.forEach(item => {
          const friendId = item.friendId
          const friend = temp.get(friendId);
          if (!friend) {
            temp.set(friendId, item)
          } else {
            if (item.createTime >= friend.createTime) {
              temp.set(friendId, item)
            }
          }
        })
        temp.forEach((value, key) => {
          this.friendMessages.push(value)
        })
      })
    },
    getAllFriendNotify () {
      GetAllFriendNotify().then(res => {
        this.friendNotifies = res.data
        console.log(this.friendNotifies)
      })
    },
    formatDateHuman (date) {
      return util.formatDateHuman(date)
    },
    agree (item) {
      this.$dialog.confirm({
        title: '标题',
        message: `确认同意添加${item.content.applicantUsername}为好友？`
      }).then(() => {
        FriendApplyForOption({
          applicant: item.content.applicant,
          option: 1
        }).then(res => {
          this.getAllFriendNotify()
          this.getInfo()
        })
      }).catch(() => {
        // on cancel
      });
    },
    refuse (item) {
      this.$dialog.confirm({
        title: '标题',
        message: `确认拒绝${item.content.applicantUsername}的好友申请？`
      }).then(() => {
        FriendApplyForOption({
          applicant: item.content.applicant,
          option: 2
        }).then(res => {
          this.getAllFriendNotify()
        })
      }).catch(() => {
        // on cancel
      });
    },
    // 聊天界面滚动到最底部
    chatUIScrollBottom () {
      if (this.show) {
        this.$nextTick(() => {
          const chatMain = this.$refs.chatMain
          const scrollHeight = chatMain.scrollHeight
          if (scrollHeight > 0) {
            chatMain.scrollTop = scrollHeight
          }
        })
      }
    },
    emojiKeyBoard () {
      if (this.emojiKeyBoardShow) {
        const $chatMain = this.$refs.chatMain
        $chatMain.style.height = `${this.clientHeight - 130}px`
        this.emojiKeyBoardShow = false
      } else {
        const $chatMain = this.$refs.chatMain
        this.emojiKeyBoardShow = true
        window.setTimeout(() => {
          $chatMain.style.height = `${this.clientHeight - 130 - 160}px`
          // this.chatUIScrollBottom()
        }, 300)
      }
    },
    emojiSelect (emoji_) {
      ParseToHtmlDecimal({
        aliase: emoji_
      }).then(res => {
        this.messageCurrent = `${this.messageCurrent + res.data}`
      })
      // '😂😂😂'
    }
  },
  computed: {
    ...mapGetters([
      'friendMap',
      'user',
      'socket'
    ]),
    createTime () {
      return this.socket.receive.createTime
    }
  },
  watch: {
    'createTime': function () {
      // console.log(this.socket)
    }
  },
  updated () {
    this.chatUIScrollBottom()
  },
  mounted () {
    this.getFriendMessages()
    this.getAllFriendNotify()
    // const friendId = this.$route.query.id
    this.$options.sockets.onmessage = (data) => {
      if (!this.show) {
        this.friendMessages = []
        GetFriendMessages().then(res => {
          let temp = new Map()
          this.friendMessagesAll = res.data
          this.friendMessagesAll.forEach(item => {
            const friendId = item.friendId
            const friend = temp.get(friendId);
            if (!friend) {
              temp.set(friendId, item)
            } else {
              if (item.createTime >= friend.createTime) {
                temp.set(friendId, item)
              }
            }
          })
          temp.forEach((value, key) => {
            this.friendMessages.push(value)
          })
        })
      }
      const receive = JSON.parse(data.data)
      let temp = {}
      temp.img = this.friendMap.get(receive.from).avatar
      temp.user = this.friendMap.get(receive.from).username
      temp.mine = false
      temp.date = util.formatDate.format(new Date(), 'yyyy-MM-dd hh:mm:ss')
      temp.msg = receive.content
      this.messages.push(temp)
    }
  },
  created () {
    this.clientHeight = `${document.documentElement.clientHeight}`
    window.addEventListener('resize', () => {
      this.clientHeight = `${document.documentElement.clientHeight}`
    })
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  /*@import "../styles/layui/layui.css";*/
  /*@import "../styles/layui/layim.css";*/

  .layim-chat-footer-keyboard-up {
    position: fixed;
    width: 100%;
    bottom: 160px;
    background-color: white;
  }
  .layim-chat-footer-keyboard-down {
    position: fixed;
    width: 100%;
    bottom: 0;
    background-color: white;
  }
  .chat {
    margin-top: 46px;
    .chat-message-list {
      overflow-x: hidden;
      overflow-y: auto;
    }
  }
  .chat-popup {
    height: 100%;
    width: 100%;
  }
  .layim-chat-footer .message-send-button {
    position: absolute;
    right: 0;
    bottom: -5px;
    /*margin-bottom: 7px;*/
    margin-top: 5px;
    margin-right: 15px;
  }
  .layim-chat-main {
    height: 500px;
  }
  /*.layim-chat-footer {*/
    /*position: fixed;*/
    /*width: 100%;*/
    /*bottom: 0;*/
    /*background-color: white;*/
  /*}*/
  .chat-frient-notify {
    font-size: 14px;
    .layim-msgbox {
      margin: 15px;
    }
    .layim-msgbox li {
      position: relative;
      margin-bottom: 10px;
      padding: 0 130px 10px 50px;
      line-height: 22px;
      border-bottom: 1px dotted #e2e2e2;
    }
    .layim-msgbox .layim-msgbox-tips{margin: 0; padding: 10px 0; border: none; text-align: center; color: #999;}
    .layim-msgbox .layim-msgbox-system{padding: 0 10px 10px 10px;}
    .layim-msgbox li p span{padding-left: 5px; color: #999;}
    .layim-msgbox li p em{font-style: normal; color: #FF5722;}

    .layim-msgbox-avatar {
      position: absolute;
      left: 0;
      top: 0;
      width: 36px;
      height: 36px;
      margin-top: 15px;
    }
    .layim-msgbox-user{padding-top: 5px;}
    .layim-msgbox-content{margin-top: 3px;}
    .msgbox-postscript {
      color: #999;
    }
    .layim-msgbox .layui-btn-small{padding: 0 15px; margin-left: 5px;}
    .layim-msgbox-btn{position: absolute; right: 0; top: 20px; color: #999;}
  }
</style>
