<template>
  <div class="chat">
    <div>
      <ul class="layui-layim-list layui-show">
        <li layim-event="chat" data-type="friend" data-index="0" class="layim-friend100001 " @click="chatPopupOpen"><img
          src="//tva1.sinaimg.cn/crop.0.0.118.118.180/5db11ff4gw1e77d3nqrv8j203b03cweg.jpg"><span>贤心</span>
          <p>这些都是测试数据，实际使用请严格按照该格式返回</p><span class="layim-msg-status">new</span></li>
        <li layim-event="chat" data-type="friend" data-index="0" class="layim-friend100001222 "><img
          src="//tva4.sinaimg.cn/crop.0.1.1125.1125.180/475bb144jw8f9nwebnuhkj20v90vbwh9.jpg"><span>刘小涛</span>
          <p>如约而至，不负姊妹欢乐颂</p><span class="layim-msg-status">new</span></li>
        <li layim-event="chat" data-type="friend" data-index="0" class="layim-friend10034001 "><img
          src="//tva2.sinaimg.cn/crop.1.0.747.747.180/633f068fjw8f9h040n951j20ku0kr74t.jpg"><span>谢小楠</span>
          <p></p><span class="layim-msg-status">new</span></li>
        <li layim-event="chat" data-type="friend" data-index="0" class="layim-friend168168 layim-list-gray"><img
          src="//tva1.sinaimg.cn/crop.0.0.180.180.180/7fde8b93jw1e8qgp5bmzyj2050050aa8.jpg"><span>马小云</span>
          <p>让天下没有难写的代码</p><span class="layim-msg-status">new</span></li>
        <li layim-event="chat" data-type="friend" data-index="0" class="layim-friend666666 "><img
          src="//tva1.sinaimg.cn/crop.0.0.512.512.180/6a4acad5jw8eqi6yaholjj20e80e8t9f.jpg"><span>徐小峥</span>
          <p>代码在囧途，也要写到底</p><span class="layim-msg-status">new</span></li>
      </ul>
    </div>
    <van-popup
      v-model="show"
      class="chat-popup"
      position="right">
      <van-nav-bar
        :title="chatFriend"
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
            <div class="layim-chat-text">{{item.msg}}</div>
          </li>
        </ul>
      </div>
      <div class="layim-chat-footer" ref="chatFooter">
        <!--<div class="layim-chat-textarea"><textarea></textarea></div>-->
        <div style="position: relative">
          <el-input
            v-model="messageCurrent"
            type="textarea"
            autosize
            placeholder="请输入内容">
          </el-input>
          <el-button type="text" class="message-send-button" @click="sendMessage">发送</el-button>
        </div>
        <div class="layui-unselect layim-chat-tool">
          <span class="layui-icon layim-tool-face" title="选择表情" layim-event="face"></span>
          <span class="layui-icon layim-tool-image" title="上传图片" layim-event="image">
            <input type="file" name="file">
          </span>
          <span class="layui-icon layim-tool-image" title="发送文件" layim-event="image" data-type="file">
            <input type="file" name="file">
          </span>
          <span class="layim-tool-log" layim-event="chatLog"><i class="layui-icon"></i>聊天记录</span>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { SendMessage } from '../api/tuling'
import util from '@/utils/util'
export default {
  name: 'Chat',
  data () {
    return {
      show: false,
      chatFriend: '贤心',
      messageCurrent: '',
      messages: [
        {
          img: '//tva1.sinaimg.cn/crop.0.0.118.118.180/5db11ff4gw1e77d3nqrv8j203b03cweg.jpg',
          date: '2019-04-29 20:17:41',
          user: '纸飞机',
          msg: '哈哈哈',
          mine: true
        },
        {
          img: '//tva3.sinaimg.cn/crop.0.0.180.180.180/7f5f6861jw1e8qgp5bmzyj2050050aa8.jpg',
          date: '2019-04-29 20:17:42',
          user: '小闲',
          msg: '嘻嘻嘻',
          mine: false
        },
        {
          img: '//tva1.sinaimg.cn/crop.0.0.118.118.180/5db11ff4gw1e77d3nqrv8j203b03cweg.jpg',
          date: '2019-04-29 20:17:41',
          user: '纸飞机',
          msg: '哈哈哈',
          mine: true
        },
        {
          img: '//tva3.sinaimg.cn/crop.0.0.180.180.180/7f5f6861jw1e8qgp5bmzyj2050050aa8.jpg',
          date: '2019-04-29 20:17:42',
          user: '小闲',
          msg: '嘻嘻嘻',
          mine: false
        },
        {
          img: '//tva1.sinaimg.cn/crop.0.0.118.118.180/5db11ff4gw1e77d3nqrv8j203b03cweg.jpg',
          date: '2019-04-29 20:17:41',
          user: '纸飞机',
          msg: '哈哈哈',
          mine: true
        },
        {
          img: '//tva3.sinaimg.cn/crop.0.0.180.180.180/7f5f6861jw1e8qgp5bmzyj2050050aa8.jpg',
          date: '2019-04-29 20:17:42',
          user: '小闲',
          msg: '嘻嘻嘻',
          mine: false
        },
        {
          img: '//tva1.sinaimg.cn/crop.0.0.118.118.180/5db11ff4gw1e77d3nqrv8j203b03cweg.jpg',
          date: '2019-04-29 20:17:41',
          user: '纸飞机',
          msg: '哈哈哈',
          mine: true
        },
        {
          img: '//tva3.sinaimg.cn/crop.0.0.180.180.180/7f5f6861jw1e8qgp5bmzyj2050050aa8.jpg',
          date: '2019-04-29 20:17:42',
          user: '小闲',
          msg: '嘻嘻嘻',
          mine: false
        }
      ]
    }
  },
  methods: {
    chatPopupClose () {
      this.show = false
    },
    chatPopupOpen () {
      this.show = true
    },
    sendMessage () {
      if (!this.messageCurrent) {
        return
      }
      this.$socket.send(this.messageCurrent)
      // let send = {}
      // send.img = '//tva1.sinaimg.cn/crop.0.0.118.118.180/5db11ff4gw1e77d3nqrv8j203b03cweg.jpg'
      // send.date = util.formatDate.format(new Date(), 'yyyy-MM-dd hh:mm:ss')
      // send.user = '纸飞机'
      // send.msg = this.messageCurrent
      // send.mine = true
      // this.messages.push(send)
      // const message = this.messageCurrent
      // this.messageCurrent = ''
      // SendMessage({ message }).then(res => {
      //   let receive = {}
      //   receive.img = '//tva3.sinaimg.cn/crop.0.0.180.180.180/7f5f6861jw1e8qgp5bmzyj2050050aa8.jpg'
      //   receive.date = util.formatDate.format(new Date(), 'yyyy-MM-dd hh:mm:ss')
      //   receive.user = '小闲'
      //   receive.msg = res.data.results[0].values.text
      //   receive.mine = false
      //   this.messages.push(receive)
      // }).catch(res => {
      // })
    }
  },
  computed: {
    clientHeight: {
      get () {
        return this.$store.getters.clientHeight
      }
    }
  },
  updated () {
    this.$nextTick(() => {
      const chatMain = this.$refs.chatMain
      const scrollHeight = chatMain.scrollHeight
      if (scrollHeight > 0) {
        chatMain.scrollTop = scrollHeight
      }
    })
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "../styles/layui/layui.css";
  @import "../styles/layui/layim.css";

  .chat {
    margin-top: 46px;
  }
  .chat-popup {
    height: 100%;
    width: 100%;
  }
  .layim-chat-footer .message-send-button {
    position: absolute;
    right: 0;
    bottom: 0;
    margin-bottom: 7px;
    margin-right: 15px;
  }
  .layim-chat-main {
    height: 500px;
  }
  .layim-chat-footer {
    position: fixed;
    width: 100%;
    bottom: 0;
    background-color: white;
  }
  /*.layui-layim-list {*/
    /*height: 100%;*/
  /*}*/
</style>
