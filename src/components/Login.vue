<template>
  <van-row>
    <van-row type="flex" justify="center" style="margin-bottom: 10px">
      <van-col >
        <span style="font-weight: bold; font-size: 20px;">系统登录</span>
      </van-col>
    </van-row>
    <van-field
      style="margin-bottom: 10px"
      left-icon="user"
      v-model="loginData.loginInfo"
      center
      clearable
      placeholder="请输入用户名"
    ></van-field>
    <van-field
      style="margin-bottom: 10px"
      left-icon="cloud-lock"
      :right-icon="icon"
      :type="type"
      v-model="loginData.password"
      center
      clearable
      placeholder="请输入密码"
      @click-right-icon="clickRightIconHandler"
    ></van-field>
    <div style="position: relative">
      <van-field
        style="margin-bottom: 10px"
        v-model="loginData.imgCode"
        center
        clearable
        placeholder="请输入验证码"
      ></van-field>
      <div style="position: absolute; right: 10px; top: 10px;">
        <img :src="captchaSrc" @click="changeCaptcha"/>
      </div>
    </div>
    <van-button type="primary" style="width: 60%" @click="loginHandler" :loading="loading">登录</van-button>
  </van-row>
</template>

<script>
import { RequestLogin, CheckUserName, CheckPhone, CheckEmail, CheckImgCode, SendCodeToPhone, Register } from '@/api/user'
export default {
  data () {
    return {
      loginData: {
        loginInfo: '',
        password: '',
        imgCode: ''
      },
      captchaSrc: process.env.BASE_API + '/user/createImg',
      loading: false,
      icon: 'close-eye',
      type: 'password'
    }
  },
  methods: {
    clickRightIconHandler () {
      if (this.icon === 'close-eye') {
        this.icon = 'open-eye'
        this.type = 'text'
      } else {
        this.icon = 'close-eye'
        this.type = 'password'
      }
    },
    changeCaptcha () {
      this.captchaSrc = `${process.env.BASE_API}/user/createImg?${new Date().getTime()}`
    },
    loginHandler () {
      if (!this.loginData.loginInfo || !this.loginData.password || !this.loginData.imgCode) {
        this.$toast.fail('请完善登陆信息')
      } else {
        this.loading = true
        RequestLogin({ ...this.loginData }).then(res => {
          this.loading = false
          this.$router.push({ path: '/fileList' })
        }).catch(res => {
          this.loading = false
        })
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
