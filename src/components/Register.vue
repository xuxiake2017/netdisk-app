<template>
  <div class="login-outter" :style="{'height': `${clientHeight}px`}">
    <div>
      <img src="../assets/reg_avatar.png" class="login-avatar"/>
    </div>
    <van-row class="login-field">
      <van-row type="flex" justify="center" style="margin-bottom: 10px">
        <van-col >
          <span class="login-title">系统注册</span>
        </van-col>
      </van-row>
      <van-field
        class="login-input"
        left-icon="my-user"
        v-model="regData.email"
        center
        clearable
        placeholder="请输入邮箱"
        :error-message="errorMessage.email"
        @blur="validateEmail"
      ></van-field>
      <van-field
        class="login-input"
        left-icon="my-cloud-lock"
        :right-icon="icon"
        :type="type"
        v-model="regData.password"
        center
        clearable
        placeholder="请输入密码"
        @click-right-icon="clickRightIconHandler"
        :error-message="errorMessage.password"
        @blur="validatePassword"
      ></van-field>
      <div style="position: relative">
        <van-field
          class="login-input"
          v-model="regData.imgCode"
          left-icon="my-captcha"
          center
          clearable
          placeholder="请输入验证码"
          :error-message="errorMessage.imgCode"
          maxlength="4"
          @blur="validateCaptcha"
        ></van-field>
        <div class="login-captcha">
          <img :src="captchaSrc" @click="changeCaptcha"/>
        </div>
      </div>
      <van-row style="text-align: left; margin-left: 15px; margin-right: 15px;">
        <el-button type="text" @click="toLogin">已有账号？立即登录</el-button>
      </van-row>
      <van-button type="primary" style="width: 60%" @click="regHandler" :loading="loading">注册</van-button>
    </van-row>
  </div>
</template>

<script>
import { RegisterApp } from '@/api/user'
import { checkEmail, validateCaptcha, validatePassword } from '../utils/validate'
export default {
  data () {
    return {
      regData: {
        email: '',
        password: '',
        imgCode: ''
      },
      captchaSrc: process.env.BASE_API + '/user/createImg',
      loading: false,
      icon: 'my-close-eye',
      type: 'password',
      clientHeight: '',
      errorMessage: {
        email: '',
        password: '',
        imgCode: ''
      }
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
    validateEmail () {
      this.errorMessage.email = checkEmail(this.regData.email).message
    },
    validatePassword () {
      this.errorMessage.password = validatePassword(this.regData.password).message
    },
    validateCaptcha () {
      this.errorMessage.imgCode = validateCaptcha(this.regData.imgCode).message
    },
    regHandler () {
      if (!this.regData.email || !this.regData.password || !this.regData.imgCode) {
        this.$toast.fail('请完善注册信息')
      } else {
        this.validateEmail()
        this.validatePassword()
        this.validateCaptcha()
        for (let key in this.errorMessage) {
          if (this.errorMessage[key]) {
            return
          }
        }
        this.loading = true
        RegisterApp({ ...this.regData }).then(res => {
          this.loading = false
          this.$dialog.confirm({
            title: '提示',
            message: '注册成功，是否立即登录？'
          }).then(() => {
            this.$router.push({ path: '/login' })
          }).catch(() => {
            // on cancel
          })
        }).catch(res => {
          this.loading = false
        })
      }
    },
    toLogin () {
      this.$router.push({ path: '/login' });
    }
  },
  created () {
    this.changeCaptcha()
    this.clientHeight = `${document.documentElement.clientHeight}`
    window.addEventListener('resize', () => {
      this.clientHeight = `${document.documentElement.clientHeight}`
    })
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
    background: url("../assets/reg_bg.jpg") no-repeat center;
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
