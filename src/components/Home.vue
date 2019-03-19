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
    <router-view></router-view>
  </div>
</template>

<script>
import { Logout } from '@/api/user'
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
    user: {
      get () {
        return this.$store.getters.user
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
  }
</style>
