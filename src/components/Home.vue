<template>
  <div class="float-left">
    <van-popup v-model="popupShow" position="left" class="my-popup">
      <van-row class="user-info">
        <van-row class="avatar-popup">
          <van-col>
            <img :src="user.avatar"/>
          </van-col>
          <van-col offset="2" class="username">
            {{user.name}}
          </van-col>
        </van-row>
        <van-cell :icon="item.meta.icon" is-link v-for="(item, index) in routes" :key="index" @click="jump(item.path)">
          <template slot="title">
            <span class="custom-text">{{item.meta.title}}</span>
          </template>
        </van-cell>
        <van-cell icon="my-logout" is-link @click="logout">
          <template slot="title">
            <span class="custom-text">注销</span>
          </template>
        </van-cell>
      </van-row>
    </van-popup>
    <van-nav-bar :title="title" :fixed="true" @click-left="clickLeftHandler" @click-right="clickRightHandler">
      <van-icon v-if="$route.name === 'fileList'" name="my-fileupload" slot="right" :size="'20px'"/>
      <van-button v-if="$route.name === 'gallery'" type="primary" slot="right" size="mini">返回</van-button>
      <img :src="user.avatar" class="avatar-top" slot="left"/>
    </van-nav-bar>
    <router-view></router-view>
  </div>
</template>

<script>
import { Logout } from '@/api/user'
import { mapGetters } from 'vuex'
export default {
  name: 'Home',
  data () {
    return {
      routes: []
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
      'user'
    ]),
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
      if (this.$route.name === 'fileList') {
        this.uploadPopupShow = true
      } else if (this.$route.name === 'gallery') {
        this.$router.go(-1)
      }
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
</style>
