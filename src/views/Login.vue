<template>
  <div class="login-outter" :style="{'height': `${clientHeight}px`}">
    <div>
      <img src="../assets/login_avatar.jpg" class="login-avatar"/>
    </div>
    <van-row class="login-field">
      <van-row type="flex" justify="center" style="margin-bottom: 10px">
        <van-col >
          <span class="login-title">系统登录</span>
        </van-col>
      </van-row>
      <van-field
        class="login-input"
        left-icon="my-user"
        v-model="loginData.loginInfo"
        center
        clearable
        placeholder="请输入用户名"
      ></van-field>
      <van-field
        class="login-input"
        left-icon="my-cloud-lock"
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
          class="login-input"
          v-model="loginData.imgCode"
          left-icon="my-captcha"
          center
          clearable
          placeholder="请输入验证码"
          maxlength="4"
        ></van-field>
        <div class="login-captcha">
          <img :src="captchaSrc" @click="changeCaptcha"/>
        </div>
      </div>
      <van-row style="text-align: left; margin-left: 15px; margin-right: 15px;">
        <el-button type="text" @click="toReg">没有账号？立即注册</el-button>
      </van-row>
      <van-button type="primary" style="width: 60%" @click="loginHandler" :loading="loading">登录</van-button>
    </van-row>
  </div>
</template>

<script>
import { RequestLogin } from '@/api/user'
import { setToken } from '@/utils/auth'
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
      icon: 'my-close-eye',
      type: 'password',
      clientHeight: ''
    }
  },
  methods: {
    clickRightIconHandler () {
      if (this.icon === 'my-close-eye') {
        this.icon = 'my-open-eye'
        this.type = 'text'
      } else {
        this.icon = 'my-close-eye'
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
          // this.$store.commit('storeUser', res.data)
          setToken(res.data.token)
          this.$router.push({ path: '/fileList' })
          // 打开websocket连接
          this.$connect()
        }).catch(res => {
          this.loading = false
        })
      }
    },
    toReg () {
      this.$router.push({ path: '/register' });
    }
  },
  created () {
    this.clientHeight = `${document.documentElement.clientHeight}`
    this.changeCaptcha()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style rel="stylesheet/scss" lang="scss" scoped>
  .login-outter {
    width: 100%;
    position: relative;
    margin: 0 0;
    background-size: auto;
    background: url("../assets/login_bg.jpg") no-repeat center;
  }
  .login-avatar {
    width: 80px;
    height: 80px;
    border-radius: 40px 40px;
    margin-top: 50px;
    box-shadow:2px 2px 4px #333333;
  }
  .login-field {
    width: 80%;
    border-radius: 5px;
    padding: 35px 15px 35px 15px;
    background: #fff;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #7d7d7d;
    margin: 40px auto auto;
  }
  .login-title {
    font-weight: bold;
    font-size: 20px;
  }
  .login-input {
    margin-bottom: 10px;
  }
  .login-captcha {
    position: absolute;
    right: 10px;
    top: 10px;
  }
</style>
