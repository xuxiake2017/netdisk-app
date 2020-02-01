<template>
  <div class="chat">
    <!--消息列表-->
    <div class="chat-message-list" :style="{'height': `${clientHeight - 100}px`}" v-if="active === 0">
      <van-pull-refresh v-model="isLoadingMessage" @refresh="onRefresh" :style="{'height': `${clientHeight - 100}px`}">
        <ul class="layui-layim-list layui-show">
          <li v-for="(item, index) in friendMessages" :key="index" @click="toChatDialog(item.friendId)">
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
        <li v-for="(item, index) in user.friendList" :key="index" @click="toChatDialog(item.friendId)">
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
    <van-actionsheet
      v-model="addActionSheetShow"
      :actions="actions"
      @select="onSelect"
    />
  </div>
</template>

<script>
import { FriendApplyForOption } from '@/api/friendApplyFor'
import util from '@/utils/util'
import { mapGetters } from 'vuex'
import ChatFileList from '@/components/ChatFileList'
export default {
  name: 'Chat',
  components: {
    ChatFileList
  },
  data () {
    return {
      active: 0,
      // 好友申请验证
      applyVerify: {
        1: '同意',
        2: '拒绝'
      },
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
      // 是否正在刷新标记（消息列表）
      isLoadingMessage: false,
      // 是否正在刷新标记（通知列表）
      isLoadingNotify: false
    }
  },
  mounted () {
    this.$store.dispatch('GetAllFriendNotify')
    if (this.friendMessages.length === 0) {
      this.$store.dispatch('GetFriendMessages')
    }
  },
  computed: {
    ...mapGetters([
      'user',
      'friendMessages',
      'clientHeight',
      'friendNotifies'
    ]),
    addActionSheetShow: {
      get () {
        return this.$store.getters.addActionSheetShow
      },
      set (val) {
        this.$store.commit('toggleAddActionSheetShow', val)
      }
    }
  },
  methods: {
    // 打开聊天对话
    toChatDialog (friendId) {
      this.$router.push({
        name: 'chatDialog',
        params: {
          friendId
        }
      })
    },
    // 将时间格式化成人能看懂的
    formatDateHuman (date) {
      return util.formatDateHuman(date)
    },
    // 下拉刷新
    onRefresh () {
      window.setTimeout(() => {
        if (this.active === 0) {
          this.$store.dispatch('GetFriendMessages').then(res => {
            this.isLoadingMessage = false
          })
        } else if (this.active === 2) {
          this.$store.dispatch('GetAllFriendNotify').then(res => {
            this.isLoadingNotify = false
          })
        }
      }, 500)
    },
    // 上拉框选择
    onSelect (item, index) {
      if (item.name === '添加好友') {
        this.$router.push({
          name: 'addFriend'
        })
      }
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
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .chat {
    margin-top: 46px;
    .chat-message-list {
      overflow-x: hidden;
      overflow-y: auto;
    }
  }
  .chat-frient-notify {
    font-size: 14px;
    .layim-msgbox {
      margin: 15px;
    }
    .layim-msgbox li {
      position: relative;
      margin-bottom: 10px;
      padding: 0 10px 10px 50px;
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
