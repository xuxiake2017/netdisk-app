<template>
  <div class="chat">
    <!--消息列表-->
    <div class="chat-message-list" :style="{'height': `${clientHeight - 100}px`}" v-if="active === 0">
      <van-pull-refresh v-model="isLoadingMessage" @refresh="onRefresh" :style="{'height': `${clientHeight - 100}px`}">
        <ul class="layui-layim-list layui-show">
          <li v-for="(item, index) in friendMessages" :key="index" @click="chatPopupOpen(item.friendId)">
            <img :src="item.friendAvatar"/>
            <span>{{item.friendName}}</span>
            <p v-if="item.content">{{item.content}}</p>
            <p v-if="item.fileId">[文件]</p>
          </li>
        </ul>
      </van-pull-refresh>
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
      <van-pull-refresh v-model="isLoadingNotify" @refresh="onRefresh" :style="{'height': `${clientHeight - 100}px`}">
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
      </van-pull-refresh>
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
      position="right"
      :fixed="true">
      <van-nav-bar
        v-if="friend"
        :title="friend.username"
        left-text="返回"
        left-arrow
        @click-left="chatPopupClose">
      </van-nav-bar>
      <div class="layim-chat-main" :style="{'height': `${clientHeight - 130}px`}" ref="chatMain" @scroll="onScrollHandler">
        <van-pull-refresh v-model="isLoading" @refresh="onRefresh">
          <ul>
            <li v-for="item in messages" :key="item.id" :class="{ 'layim-chat-mine': item.mine }">
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
                <chat-text :msg="item.msg" :file-id="item.fileId" @file-click="fileClick"></chat-text>
              </div>
            </li>
          </ul>
        </van-pull-refresh>
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
          <span class="layui-icon layim-tool-face" title="选择表情" @click="emojiKeyBoard" :class="{'emoji-key-board-show': emojiKeyBoardShow, 'emoji-key-board-hide': !emojiKeyBoardShow}"></span>
          <span class="layui-icon layim-tool-image" title="上传图片">
            <input type="file" name="file">
          </span>
          <span class="layui-icon layim-tool-image" title="发送文件" @click="chatFileListPopupOpen"></span>
          <span class="layim-tool-log"><i class="layui-icon"></i>聊天记录</span>
        </div>
      </div>
      <emoji style="position: absolute; bottom: 0" v-if="emojiKeyBoardShow" @select="emojiSelect"></emoji>
      <!--回到聊天界面底部按钮-->
      <div class="to-chat-bottom-btn" @click="chatUIScrollBottom" v-if="toBottomFlag">
        <van-icon name="arrow-down" :size="'25px'"/>
      </div>
    </van-popup>
    <van-popup
      v-model="addFriendPopupShow"
      class="add-friend-popup"
      position="right">
      <van-nav-bar
        :title="addAction"
        left-text="返回"
        left-arrow
        @click-left="addFriendPopupClose">
      </van-nav-bar>
      <el-input placeholder="用户名/手机/邮箱" class="input-with-select" size="medium" v-model="searchKey">
        <i slot="suffix" class="el-input__icon el-icon-search" style="color: #1989fa;" @click="searchFriend"></i>
      </el-input>
      <div>
        <ul class="layui-layim-list layui-show">
          <li v-for="(item, index) in searchResult" :key="index" @click="openAddFriendConfirmDialog(item)">
            <img :src="item.avatar"/>
            <span>{{item.username}}</span>
            <p>{{item.signature}}</p>
          </li>
        </ul>
        <div class="layui-flow-more" v-if="searchAction && searchResult.length === 0">
          <li class="layim-msgbox-tips">暂无更多</li>
        </div>
      </div>
      <van-dialog
        v-model="addFriendConfirmDialogShow"
        title="添加好友"
        show-cancel-button
        class="add-friend-confirm-dialog"
        :before-close="beforeCloseHandler"
      >
        <div id="" class="layui-layer-content">
          <div class="layim-add-box">
            <div class="layim-add-img">
              <img class="layui-circle" :src="addApplyForData.avatar">
              <p>{{addApplyForData.username}}</p>
            </div>
            <div class="layim-add-remark">
              <van-field
                v-model="addApplyForData.postscript"
                label="验证信息"
              />
            </div>
          </div>
        </div>
      </van-dialog>
    </van-popup>
    <van-actionsheet
      v-model="addActionSheetShow"
      :actions="actions"
      @select="onSelect"
    />
    <van-popup
      v-model="chatFileListPopup"
      class="chat-file-list-popup"
      position="bottom">
      <chat-file-list
        @chat-file-list-popup-close="chatFileListPopupClose"
        @select-file="selectFileSend">
      </chat-file-list>
    </van-popup>
    <media-preview
      :show="mediaPopupShow"
      :mediaFile="mediaFile"
      @media-popup-close="mediaPopupClose">
    </media-preview>
  </div>
</template>

<script>
// import { SendMessage } from '../api/tuling'
import { GetFriendMessages } from '../api/friendMessage'
import { GetAllFriendNotify } from '../api/friendNotify'
import { FriendApplyForOption, SearchFriend, AddFriendRequest } from '../api/friendApplyFor'
import usermixin from '@/mixins/userInfo'
import mediaPreview from '@/mixins/mediaPreview'
import util from '@/utils/util'
import { mapGetters } from 'vuex'
import Emoji from '../components/Emoji'
import ChatText from '../components/ChatText'
import ChatFileList from '../components/ChatFileList'
import { ParseToHtmlDecimal } from '../api/emoji'
export default {
  name: 'Chat',
  mixins: [usermixin, mediaPreview],
  components: {
    Emoji,
    ChatText,
    ChatFileList
  },
  data () {
    return {
      clientHeight: '',
      active: 0,
      // 聊天弹窗打开关闭标记
      show: false,
      // 聊天输入框的内容
      messageCurrent: '',
      // 存放与单个好友的消息
      messagesMap: new Map(),
      // 存放分页信息
      paginationMap: new Map(),
      // 当前聊天页面的好友消息
      messages: [],
      pagination: null,
      // 与好友的消息列表（包含一条最新的消息）
      friendMessages: [],
      // 当前对话的好友
      friend: null,
      // 所有的聊天记录
      friendMessagesAll: [],
      // 好友通知
      friendNotifies: [],
      // 好友申请验证
      applyVerify: {
        1: '同意',
        2: '拒绝'
      },
      // emoji键盘显示关闭标记
      emojiKeyBoardShow: false,
      actions: [
        {
          name: '添加好友'
        },
        {
          name: '添加群'
        }
      ],
      // 添加好友对话框标记
      addFriendPopupShow: false,
      // 上拉框动作
      addAction: '',
      // 好友搜索的关键字
      searchKey: '',
      // 搜索动作
      searchAction: false,
      // 搜索结果
      searchResult: [],
      // 添加好友确认对话框标记
      addFriendConfirmDialogShow: false,
      // 添加好友请求数据
      addApplyForData: {
        respondent: '',
        username: '',
        avatar: '',
        postscript: ''
      },
      // 文件选择弹框标记
      chatFileListPopup: false,
      // 是否正在刷新标记（消息列表）
      isLoadingMessage: false,
      // 是否正在刷新标记（通知列表）
      isLoadingNotify: false,
      // 是否正在刷新标记（聊天对话消息列表）
      isLoading: false,
      // 是否显示到底部按钮标记
      toBottomFlag: false
    }
  },
  methods: {
    // 聊天对话框关闭
    chatPopupClose () {
      this.show = false
      this.emojiKeyBoardShow = false
      this.$refs.chatMain.style.height = `${this.clientHeight - 130}px`
      this.messageCurrent = ''
      // this.getFriendMessages()
      this.messages = []
    },
    // 整理好友消息
    makeFriendMessages (friendId) {
      // 获取消息
      if (!this.messagesMap.get(friendId)) {
        let messages = []
        this.friendMessagesAll.forEach(item => {
          let temp = {}
          if (friendId === item.friendId) {
            if (item.from === this.user.id) {
              // 自己发送的消息
              temp.img = item.userAvatar
              temp.user = item.userName
              temp.mine = true
            } else {
              // 好友发送的消息
              temp.img = item.friendAvatar
              temp.user = item.friendName
              temp.mine = false
            }
            temp.date = util.formatDate.format(new Date(item.createTime), 'yyyy-MM-dd hh:mm:ss')
            temp.msg = item.content
            temp.fileId = item.fileId
            temp.id = item.id
            messages.push(temp)
          }
        })
        this.messagesMap.set(friendId, messages)
        this.messages = messages
      } else {
        this.messages = this.messagesMap.get(friendId)
        // Object.assign(this.messages, this.messagesMap.get(friendId))
      }
      // 获取分页
      if (!this.paginationMap.get(friendId)) {
        let temp = {}
        temp['pageNum'] = 1
        temp['pageSize'] = 100
        this.paginationMap.set(friendId, temp)
      }
      this.pagination = this.paginationMap.get(friendId)
    },
    // 聊天对话框打开
    chatPopupOpen (friendId) {
      this.show = true
      this.friend = this.friendMap.get(friendId)
      this.makeFriendMessages(friendId)
      this.chatUIScrollBottom()
    },
    // 发送消息
    sendMessage () {
      if (!this.messageCurrent) {
        return
      }
      if (!this.socket.isConnected) {
        this.$toast('websocket连接断开，请刷新页面!')
        return
      }
      this.messagePackagingAndSend(this.messageCurrent)
    },
    // 消息打包以及发送
    messagePackagingAndSend (msg, fileId) {
      let packet = {}
      packet['from'] = this.user.id
      packet['to'] = this.friend.friendId
      if (msg) {
        packet['content'] = msg
      } else if (fileId) {
        packet['fileId'] = fileId
      }
      packet['createTime'] = new Date().getTime()
      // 接收消息的好友user与friend的位置会对调
      packet['userId'] = this.friend.friendId
      packet['userName'] = this.friend.username
      packet['userAvatar'] = this.friend.avatar
      packet['friendId'] = this.user.id
      packet['friendName'] = this.user.name
      packet['friendAvatar'] = this.user.avatar

      let messageBase = {}
      messageBase['type'] = 'FRIEND'
      messageBase['content'] = packet
      messageBase['createTime'] = new Date().getTime()
      this.$socket.send(JSON.stringify(messageBase))
      let temp = {}
      temp.img = this.user.avatar
      temp.user = this.user.name
      temp.mine = true
      temp.date = util.formatDate.format(new Date(), 'yyyy-MM-dd hh:mm:ss')
      temp.msg = msg
      temp.fileId = fileId
      temp.id = this.guid()
      this.messagesMap.get(packet['to']).push(temp)
      this.messageCurrent = ''

      let sendTrim = {}
      sendTrim.from = packet['from']
      sendTrim.to = packet['to']
      sendTrim.fileId = packet['fileId']
      sendTrim.content = packet['content']
      sendTrim.createTime = packet['createTime']
      sendTrim.userId = packet['from']
      sendTrim.userName = packet['friendName']
      sendTrim.userAvatar = packet['friendAvatar']
      sendTrim.friendId = packet['to']
      sendTrim.friendName = packet['userName']
      sendTrim.friendAvatar = packet['userAvatar']
      this.friendMessagesAll.push(sendTrim)
      this.friendMessages.forEach((item, index) => {
        if (item.friendId === sendTrim.friendId) {
          this.$set(this.friendMessages, index, sendTrim)
        }
      })
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
    // 从后台获取历史消息
    getFriendMessages () {
      this.friendMessages.splice(0)
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
    // 获取所有通知
    getAllFriendNotify () {
      GetAllFriendNotify().then(res => {
        this.friendNotifies = res.data
      })
    },
    // 将时间格式化成人能看懂的
    formatDateHuman (date) {
      return util.formatDateHuman(date)
    },
    // 同意添加好友
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
    // 拒绝添加好友
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
    // emoji键盘开启关闭
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
    // 选中emoji调用
    emojiSelect (emoji_) {
      ParseToHtmlDecimal({
        aliase: emoji_
      }).then(res => {
        this.messageCurrent = `${this.messageCurrent + res.data}`
      })
      // '😂😂😂'
    },
    // 上拉框选择
    onSelect (item, index) {
      if (item.name === '添加好友') {
        this.addAction = item.name
        this.addFriendPopupShow = true
        this.addActionSheetShow = false
      }
    },
    // 添加好友弹出层关闭
    addFriendPopupClose () {
      this.addFriendPopupShow = false
      this.searchKey = ''
      this.searchAction = false
      this.searchResult = []
    },
    // 搜索好友
    searchFriend () {
      if (!this.searchKey) {
        return
      }
      SearchFriend({ key: this.searchKey }).then(res => {
        this.searchAction = true
        this.searchResult = res.data
      })
    },
    // 打开添加好友确认对话框
    openAddFriendConfirmDialog (item) {
      this.addApplyForData.respondent = item.userId
      this.addApplyForData.username = item.username
      this.addApplyForData.avatar = item.avatar
      this.addApplyForData.postscript = `我是${this.user.name}，申请添加好友`
      this.addFriendConfirmDialogShow = true
    },
    // 发送添加好友请求
    sendAddFriednRequest (done) {
      AddFriendRequest({ ...this.addApplyForData }).then(res => {
        this.$toast('添加好友请求发送成功! ')
        done()
        this.getAllFriendNotify()
      }).catch(res => {
        done(false)
      })
    },
    // 添加好友确认对话框关闭
    beforeCloseHandler (action, done) {
      if (action === 'confirm') {
        this.sendAddFriednRequest(done)
      } else {
        done()
      }
    },
    // 文件列表对话框打开
    chatFileListPopupOpen () {
      this.chatFileListPopup = true
    },
    // 文件列表对话框关闭
    chatFileListPopupClose () {
      this.chatFileListPopup = false
    },
    // 选择要发送的文件
    selectFileSend (item) {
      console.log(item)
      this.messagePackagingAndSend(null, item.id)
      this.chatFileListPopup = false
    },
    // 点击已经发送的文件进行预览或者下载
    fileClick (file) {
      const fileType = file.fileType
      switch (fileType) {
        case this.$NetdiskConstant.FILE_TYPE_OF_PIC:
          this.imagePreview(file)
          break
        case this.$NetdiskConstant.FILE_TYPE_OF_VIDEO:
          this.mediaPreview(file)
          break
        case this.$NetdiskConstant.FILE_TYPE_OF_MUSIC:
          this.mediaPreview(file)
          break
        default:
          this.$dialog.confirm({
            title: '提示',
            message: `确认下载该文件？`
          }).then(res => {
            window.open(`${process.env.BASE_API}/file/downLoad?fileSaveName=${file.fileSaveName}`, '_blank');
          }).catch(res => {
            // 取消
          })
      }
    },
    // 下拉刷新
    onRefresh () {
      window.setTimeout(() => {
        if (this.show) {
          let messages = this.messagesMap.get(this.friend.friendId)
          this.pagination.pageNum++
          GetFriendMessages({
            pageNum: this.pagination.pageNum,
            pageSize: this.pagination.pageSize,
            friendId: this.friend.friendId
          }).then(res => {
            const chatMain = this.$refs.chatMain
            const scrollHeightOld = chatMain.scrollHeight
            let array = []
            res.data.list.forEach(item => {
              let temp = {}
              if (item.from === this.user.id) {
                // 自己发送的消息
                temp.img = item.userAvatar
                temp.user = item.userName
                temp.mine = true
              } else {
                // 好友发送的消息
                temp.img = item.friendAvatar
                temp.user = item.friendName
                temp.mine = false
              }
              temp.date = util.formatDate.format(new Date(item.createTime), 'yyyy-MM-dd hh:mm:ss')
              temp.msg = item.content
              temp.fileId = item.fileId
              temp.id = item.id
              array.push(temp)
            })
            messages.splice(0, 0, ...array)
            this.isLoading = false
            window.setTimeout(() => {
              const scrollHeightNew = chatMain.scrollHeight
              chatMain.scrollTop = scrollHeightNew - scrollHeightOld
            }, 200)
          })
        } else {
          if (this.active === 0) {
            this.getFriendMessages()
            this.messagesMap.clear()
            this.isLoadingMessage = false
          } else if (this.active === 2) {
            this.getAllFriendNotify()
            this.isLoadingNotify = false
          }
        }
      }, 500)
    },
    // 聊天页面滚动事件处理
    onScrollHandler () {
      const chatMain = this.$refs.chatMain
      const scrollHeight = chatMain.scrollHeight
      const scrollTop = chatMain.scrollTop
      const clientHeight = chatMain.clientHeight
      // console.log('scrollHeight: ' + scrollHeight)
      // console.log('scrollTop: ' + scrollTop)
      // console.log('clientHeight: ' + clientHeight)
      if (scrollHeight >= clientHeight + scrollTop + 100) {
        this.toBottomFlag = true
      } else {
        this.toBottomFlag = false
      }
    },
    // 用于生成uuid
    S4 () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    },
    guid () {
      return (this.S4() + this.S4() + '-' + this.S4() + '-' + this.S4() + '-' + this.S4() + '-' + this.S4() + this.S4() + this.S4());
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
    },
    addActionSheetShow: {
      get () {
        return this.$store.getters.addActionSheetShow
      },
      set (val) {
        this.$store.commit('toggleAddActionSheetShow', val)
      }
    }
  },
  watch: {
    'createTime': function () {
      // console.log(this.socket)
    }
  },
  updated () {
    // this.chatUIScrollBottom()
  },
  mounted () {
    this.getFriendMessages()
    this.getAllFriendNotify()
    // const friendId = this.$route.query.id
    // 开启websocket监听器
    this.$options.sockets.onmessage = (data) => {
      const receive = JSON.parse(data.data)
      const messageContent = receive['content']
      if (receive['type'] === 'FRIEND') {
        if (!this.friendMap || !this.friendMap.get(messageContent.friendId)) {
          this.getInfo()
        }
        this.friendMessagesAll.push(messageContent)
        let friendIndex = null
        this.friendMessages.forEach((item, index) => {
          if (item.friendId === messageContent.friendId) {
            friendIndex = index
          }
        })
        if (friendIndex !== null) {
          this.$set(this.friendMessages, friendIndex, messageContent)
        } else {
          this.friendMessages.push(messageContent)
        }
        let temp = {}
        temp.img = messageContent.friendAvatar
        temp.user = messageContent.friendName
        temp.mine = false
        temp.date = util.formatDate.format(new Date(), 'yyyy-MM-dd hh:mm:ss')
        temp.msg = messageContent.content
        temp.fileId = messageContent.fileId
        let messages_ = this.messagesMap.get(messageContent.friendId)
        if (!messages_) {
          this.makeFriendMessages(messageContent.friendId)
        } else {
          messages_.push(temp)
        }
        if (!this.toBottomFlag) {
          this.chatUIScrollBottom()
        }
      } else if (receive['type'] === 'FRIEND_APPLY_FOR') {
        this.getAllFriendNotify()
      }
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
  .emoji-key-board-show {
    font-weight: bold;
  }
  .emoji-key-board-hide {
    font-weight: normal;
  }
  .add-friend-popup {
    height: 100%;
    width: 100%;
  }
  .add-friend-confirm-dialog .layim-add-remark {
    width: 100%;
    display: block;
    margin: 10px auto 0;
  }
  .add-friend-confirm-dialog .layim-add-img {
    margin: 0 auto;
    display: block;
  }
  .chat-file-list-popup {
    height: 50%;
    width: 100%;
  }
  .to-chat-bottom-btn {
    position: fixed;
    bottom: 80px;
    right: 15px;
  }
</style>
