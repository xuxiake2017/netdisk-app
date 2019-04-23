<template>
  <div>
    <van-nav-bar title="邮件验证" :fixed="true" @click-left="clickLeftHandler" @click-right="clickRightHandler">
      <van-icon name="home-o" slot="right" :size="'20px'"/>
      <img src="../assets/user.png" class="avatar-top" slot="left"/>
    </van-nav-bar>
  </div>
</template>

<script>
import { VerifyEmail } from '@/api/user'
export default {
  name: 'Verify',
  data () {
    return {

    }
  },
  methods: {
    clickLeftHandler () {
      console.log('clickLeftHandler')
      this.$router.push({ path: '/login' })
    },
    clickRightHandler () {
      console.log('clickRightHandler')
      this.$router.push({ path: '/fileList' })
    },
    verifyEmail () {
      const key = this.$route.query.key
      if (key) {
        VerifyEmail({ key }).then(res => {
          this.setInterval()
        })
      }
    },
    setInterval () {
      const toast = this.$toast.loading({
        duration: 0,
        forbidClick: true,
        loadingType: 'circular',
        message: `邮件验证成功！5秒后跳转到首页`
      })

      let second = 5;
      const timer = setInterval(() => {
        second--
        if (second) {
          toast.message = `邮件验证成功！${second}秒后跳转到首页`
        } else {
          clearInterval(timer)
          this.$toast.clear()
          this.$router.push({ path: '/fileList' })
        }
      }, 1000)
    }
  },
  mounted () {
    this.verifyEmail()
  }
}
</script>

<style scoped>
  .avatar-top {
    width: 20px;
    height: 20px;
    border-radius: 10px;
    /*box-shadow:1px 1px 3px #333333;*/
  }
</style>
