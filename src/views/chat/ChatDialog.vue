<template>
  <div class="chat-dialog">
    <van-nav-bar
      v-if="friend"
      :title="friend.nickName"
      left-text="返回"
      left-arrow
      @click-left="goBack">
    </van-nav-bar>
    <div class="layim-chat-main" :style="{'height': `${clientHeight - 138}px`}" ref="chatMain" @scroll="onScrollHandler">
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
        <el-upload
          :action="uploadAction"
          :show-file-list="false"
          :with-credentials="true"
          :on-success="onSuccessHandler"
          :before-upload="beforeUpload"
          style="display: inline-block">
          <span class="layui-icon layim-tool-image" title="上传图片"></span>
        </el-upload>
        <span class="layui-icon layim-tool-image" title="发送文件" @click="chatFileListPopupOpen"></span>
        <span class="layim-tool-log"><i class="layui-icon"></i>聊天记录</span>
      </div>
    </div>
    <emoji style="position: absolute; bottom: 0" v-if="emojiKeyBoardShow" @select="emojiSelect"></emoji>
    <!--回到聊天界面底部按钮-->
    <div class="to-chat-bottom-btn" @click="chatUIScrollBottom" v-if="toBottomFlag">
      <van-icon name="arrow-down" :size="'25px'"/>
    </div>
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
import { parseToUnicode } from '@/utils/emoji'
import util from '@/utils/util'
import { mapGetters } from 'vuex'
import mediaPreview from '@/mixins/mediaPreview'
import Emoji from '@/components/Emoji'
import ChatText from '@/components/ChatText'
import ChatFileList from '@/components/ChatFileList'
import { GetFriendMessages } from '@/api/friendMessage'
export default {
  // 聊天对话
  name: 'ChatDialog',
  mixins: [mediaPreview],
  components: {
    Emoji,
    ChatText,
    ChatFileList
  },
  data () {
    return {
      // 聊天输入框的内容
      messageCurrent: '',
      // emoji键盘显示关闭标记
      emojiKeyBoardShow: false,
      // 是否显示到底部按钮标记
      toBottomFlag: false,
      // 当前聊天页面的好友消息
      messages: [],
      // 分页
      pagination: null,
      // 当前对话的好友
      friend: null,
      // 是否正在刷新标记（聊天对话消息列表）
      isLoading: false,
      // 文件选择弹框标记
      chatFileListPopup: false,
      uploadAction: `${process.env.BASE_API}/friendMessage/uploadImage`
    }
  },
  mounted () {
    const friendId = this.$route.params.friendId
    if (!friendId) {
      this.goBack()
    }
    this.friend = this.friendMap.get(friendId)
    this.$store.dispatch('GetDialogFriendMessages', friendId).then(data => {
      this.messages = data
    })
    this.$store.dispatch('GetDialogPagination', friendId).then(data => {
      this.pagination = data
      this.chatUIScrollBottom()
    })
  },
  computed: {
    ...mapGetters([
      'friendMap',
      'paginationMap',
      'messagesMap',
      'user',
      'clientHeight',
      'receive',
      'socket'
    ]),
    createTime () {
      return this.receive.createTime
    }
  },
  watch: {
    // 监测是否收到新消息（以时间戳判断）
    'createTime': function () {
      this.chatUIScrollBottom()
    }
  },
  methods: {
    goBack () {
      this.$router.go(-1)
    },
    // 输入框获得焦点
    onFocusHandler () {
      console.log('onFocusHandler')
      this.emojiKeyBoardShow = false
      const $chatMain = this.$refs.chatMain
      $chatMain.style.height = `${this.clientHeight - 138}px`
    },
    // 输入框失去焦点
    onBlurHandler () {
      console.log('onBlurHandler')
    },
    // 选中emoji调用
    emojiSelect (emoji_) {
      this.messageCurrent = `${this.messageCurrent + parseToUnicode(emoji_)}`
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
    clearMessageCurrent () {
      this.messageCurrent = ''
    },
    // 聊天界面滚动到最底部
    chatUIScrollBottom () {
      this.$nextTick(() => {
        const chatMain = this.$refs.chatMain
        const scrollHeight = chatMain.scrollHeight
        if (scrollHeight > 0) {
          chatMain.scrollTop = scrollHeight
        }
      })
    },
    // emoji键盘开启关闭
    emojiKeyBoard () {
      if (this.emojiKeyBoardShow) {
        const $chatMain = this.$refs.chatMain
        $chatMain.style.height = `${this.clientHeight - 138}px`
        this.emojiKeyBoardShow = false
      } else {
        const $chatMain = this.$refs.chatMain
        this.emojiKeyBoardShow = true
        window.setTimeout(() => {
          $chatMain.style.height = `${this.clientHeight - 138 - 160}px`
          // this.chatUIScrollBottom()
        }, 300)
      }
    },
    // 发送消息
    sendMessage () {
      if (!this.messageCurrent) {
        return
      }
      if (!this.socket.isConnected) {
        this.$toast('socket重连中，请稍后再试!')
        this.$socket.open()
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
      packet['userName'] = this.friend.nickName
      packet['userAvatar'] = this.friend.avatar
      packet['friendId'] = this.user.id
      packet['friendName'] = this.user.name
      packet['friendAvatar'] = this.user.avatar

      let messageBase = {}
      messageBase['type'] = 'FRIEND'
      messageBase['content'] = packet
      messageBase['createTime'] = new Date().getTime()
      this.$socket.emit('on_chat_message', JSON.stringify(messageBase))
      let temp = {}
      temp.img = this.user.avatar
      temp.user = this.user.name
      temp.mine = true
      temp.date = util.formatDate.format(new Date(), 'yyyy-MM-dd hh:mm:ss')
      temp.msg = msg
      temp.fileId = fileId
      temp.id = this.guid()
      // this.messagesMap.get(packet['to']).push(temp)
      this.messages.push(temp)
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

      this.$store.commit('SET_FRIEND_MESSAGES_ALL_ITEM', sendTrim)
      this.$store.dispatch('UpdateFriendMessages', sendTrim)
      this.chatUIScrollBottom()
    },
    // 用于生成uuid
    S4 () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    },
    guid () {
      return (this.S4() + this.S4() + '-' + this.S4() + '-' + this.S4() + '-' + this.S4() + '-' + this.S4() + this.S4() + this.S4());
    },
    // 下拉刷新
    onRefresh () {
      window.setTimeout(() => {
        let messages = this.messagesMap.get(this.friend.friendId)
        this.pagination.pageNum++
        const params = {
          pageNum: this.pagination.pageNum,
          pageSize: this.pagination.pageSize,
          friendId: this.friend.friendId
        }
        GetFriendMessages(params).then(res => {
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
      }, 500)
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
    onSuccessHandler (response, file, fileList) {
      if (response.code === 20000) {
        this.messageCurrent = response.data
        this.sendMessage()
      } else {
        this.$toast('上传失败!')
      }
    },
    beforeUpload (file) {
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!this.isImage(file)) {
        this.$toast('选择的文件不是图片!')
      }
      if (!isLt2M) {
        this.$toast('上传图片大小不能超过 10MB!')
      }
      return this.isImage(file) && isLt2M;
    },
    // 判断是否是图片
    isImage (file) {
      const isJPG = file.type === 'image/jpeg'
      const isPNG = file.type === 'image/png'
      const isGIF = file.type === 'image/gif'
      if (isJPG || isPNG || isGIF) {
        return true
      } else {
        return false
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .chat-dialog {
    text-align: left;
    overflow: hidden;
  }
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
  .layim-chat-footer .message-send-button {
    position: absolute;
    right: 0;
    bottom: -5px;
    /*margin-bottom: 7px;*/
    margin-top: 5px;
    margin-right: 15px;
  }
  .emoji-key-board-show {
    font-weight: bold;
  }
  .emoji-key-board-hide {
    font-weight: normal;
  }
  .to-chat-bottom-btn {
    position: fixed;
    bottom: 80px;
    right: 15px;
  }
</style>
