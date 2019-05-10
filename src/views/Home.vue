<template>
  <div class="float-left">
    <van-popup v-model="popupShow" position="left" class="my-popup">
      <van-row class="user-info">
        <van-row class="avatar-popup" @click.native="toHome">
          <van-col>
            <img :src="user.avatar"/>
          </van-col>
          <van-col offset="2" class="username">
            {{usernameSub(user.name)}}
          </van-col>
        </van-row>
        <van-notice-bar mode="closeable">
          更多功能，请用电脑访问
        </van-notice-bar>
        <van-cell :icon="item.meta.icon" is-link v-for="(item, index) in routes" :key="index" @click="jump(item.path)">
          <template slot="title">
            <span class="custom-text">{{item.meta.title}}</span>
            <van-tag type="danger" round v-if="item.name === 'message' && user.messages.length > 0">{{user.messages.length}}</van-tag>
          </template>
        </van-cell>
        <van-cell icon="my-logout" is-link @click="logout">
          <template slot="title">
            <span class="custom-text">注销</span>
          </template>
        </van-cell>
        <van-progress :percentage="percentage" style="margin: 20px 15px"/>
        <!--<van-tag style="margin: 25px 15px; width: 150px">{{memoryInfo}}</van-tag>-->
        <!--<el-progress :text-inside="true" :stroke-width="18" :percentage="percentage" style="margin: 20px 15px">{{memoryInfo}}</el-progress>-->
      </van-row>
    </van-popup>
    <van-popup v-model="friendMessagePopupShow" position="top" :overlay="false" class="friend-message-popup layui-layer-page layui-box layui-layim-min">
      <div id="" class="layui-layer-content" style="height: 40px;" @click="jumpToChat">
        <img id="layui-layim-min" :src="friendMessage.friendAvatar" style="cursor: move;">
        <span>{{friendMessage.content}}</span>
      </div>
    </van-popup>
    <van-nav-bar :title="title" :fixed="true" @click-left="clickLeftHandler" @click-right="clickRightHandler" class="home-nav-bar">
      <img :src="user.avatar" class="avatar-top" slot="left"/>
      <van-icon v-if="$route.name === 'fileList'" name="my-fileupload" slot="right" :size="'20px'"/>
      <van-icon v-else-if="$route.name === 'chat'" name="add-o" slot="right" :size="'20px'"/>
      <van-icon v-else name="home-o" slot="right" :size="'20px'"/>
    </van-nav-bar>
    <router-view></router-view>
  </div>
</template>

<script>
import { Logout } from '@/api/user'
import { mapGetters } from 'vuex'
import { Notify } from 'vant'
import Vue from 'vue'
Vue.use(Notify);
export default {
  name: 'Home',
  data () {
    return {
      routes: [],
      friendMessagePopupShow: false,
      friendMessage: {
        content: '',
        friendId: null,
        friendUsername: '',
        friendAvatar: ''
      }
    }
  },
  computed: {
    popupShow: {
      get () {
        return this.$store.getters.popupShow
      },
      set (val) {
        this.$store.commit('togglePopup', val)
      }
    },
    ...mapGetters([
      'user',
      'receive',
      'friendMap'
    ]),
    createTime () {
      return this.receive.createTime
    },
    title: {
      get () {
        return this.$route.meta.title
      }
    },
    uploadPopupShow: {
      get () {
        return this.$store.getters.uploadPopupShow
      },
      set (val) {
        this.$store.commit('toggleUploadPopup', val)
      }
    },
    addActionSheetShow: {
      get () {
        return this.$store.getters.addActionSheetShow
      },
      set (val) {
        this.$store.commit('toggleAddActionSheetShow', val)
      }
    },
    percentage: {
      get () {
        const totalMemory = this.user.totalMemory
        const usedMemory = this.user.usedMemory
        const percentage = usedMemory / totalMemory
        return parseFloat((percentage * 100).toFixed(1))
      }
    },
    memoryInfo: {
      get () {
        return `${this.formatFileSize(parseInt(this.user.usedMemory))} / ${this.formatFileSize(parseInt(this.user.totalMemory))}`
      }
    }
  },
  watch: {
    // 监测是否收到新消息（以时间戳判断）
    'createTime': function () {
      // const routeName = this.$route.name
      // if (routeName !== 'chat') {
      //   this.friendMessagePopupShow = true
      //   this.friendMessage.friendId = this.receive.from
      //   this.friendMessage.friendUsername = this.friendMap.get(this.friendMessage.friendId).username
      //   this.friendMessage.friendAvatar = this.friendMap.get(this.friendMessage.friendId).avatar
      //   this.friendMessage.content = this.receive.content
      //   window.setTimeout(() => {
      //     this.friendMessagePopupShow = false
      //   }, 3000)
      // }
      this.friendMessagePopupShow = true
      this.friendMessage.friendId = this.receive.from
      this.friendMessage.friendUsername = this.friendMap.get(this.friendMessage.friendId).username
      this.friendMessage.friendAvatar = this.friendMap.get(this.friendMessage.friendId).avatar
      this.friendMessage.content = this.receive.content
      window.setTimeout(() => {
        this.friendMessagePopupShow = false
      }, 3000)
    }
  },
  methods: {
    logout () {
      this.$dialog.confirm({
        title: '提示',
        message: '确认注销？'
      }).then(res => {
        Logout().then(res => {
          this.$store.commit('delUser')
          location.reload();
        })
      }).catch(res => {
        // 取消
      })
    },
    jump (path) {
      this.popupShow = false
      this.$router.push({ path })
    },
    // 导航栏左边点击处理器（打开侧边栏）
    clickLeftHandler () {
      this.popupShow = true
    },
    // 导航栏右边点击处理器
    clickRightHandler () {
      switch (this.$route.name) {
        case 'fileList':
          this.uploadPopupShow = true
          break
        case 'chat':
          this.addActionSheetShow = true
          break
        default:
          this.$router.push({ path: '/fileList' })
      }
    },
    formatFileSize: function (fileSize) {
      if (fileSize) {
        if (fileSize > 1024 * 1024) {
          fileSize = fileSize / (1024 * 1024);
          return fileSize.toFixed(2) + 'M';
        }
      } else {
        return '0M';
      }
    },
    toHome () {
      this.popupShow = false
      this.$router.push({ path: '/userInfo' })
    },
    // 用户名截取显示
    usernameSub (name) {
      if (name.length > 8) {
        return `${name.substring(0, 8)}...`
      }
      return name
    },
    jumpToChat () {
      this.$router.push({
        name: 'chat',
        query: {
          id: this.friendMessage.friendId
        }
      })
    }
  },
  mounted () {
    this.$router.options.routes.forEach(routeOutter => {
      if (!routeOutter.hidden) {
        routeOutter.children.forEach(routeInner => {
          this.routes.push(routeInner)
        })
      }
    })
    if (this.user.messages && this.user.messages.length > 0) {
      Notify({
        message: '您有新的消息，请到"我的消息"中查看',
        duration: 3000,
        background: '#1989fa'
      });
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .float-left {
    text-align: left;
    .my-popup {
      height: 100%;
      width: 50%;
    }
    .user-info {
      .van-row {
        margin: 10px 10px;
      }
    }
    .avatar-popup {
      line-height: 50px;
      img {
        width: 50px;
        height: 50px;
        border-radius: 25px;
        box-shadow:1px 1px 6px #333333;
      }
      .username {
        font-weight: bold;
      }
    }
    .avatar-top {
      width: 30px;
      height: 30px;
      border-radius: 15px;
      box-shadow:1px 1px 3px #333333;
    }
  }
  .friend-message-popup {
    width: 100%;
    height: 50px;
    box-shadow: 1px 1px 50px rgba(0,0,0,.3);
  }
  .layui-layer-content span {
    width: 250px;
  }
</style>
