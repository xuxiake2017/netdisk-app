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
      v-model="loginData.username"
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
        v-model="loginData.captcha"
        center
        clearable
        placeholder="请输入验证码"
      ></van-field>
      <div style="position: absolute; right: 10px; top: 10px;">
        <img src="../assets/captcha.png"/>
      </div>
    </div>
    <van-button type="primary" style="width: 60%" @click="loginHandler">登录</van-button>
  </van-row>
</template>

<script>
import { Toast } from 'vant'
import Vue from 'vue'
Vue.use(Toast)

export default {
  name: 'HelloWorld',
  data () {
    return {
      loginData: {
        username: '',
        password: '',
        captcha: ''
      },
      msg: 'Welcome to Your Vue.js App',
      value: '',
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
    loginHandler () {
      if (!this.loginData.username || !this.loginData.password || !this.loginData.captcha) {
        Toast.fail('请将完善登陆信息')
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
