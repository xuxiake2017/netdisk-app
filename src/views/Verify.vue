<template>
  <div>
    <van-nav-bar title="邮件验证" :fixed="true" @click-left="clickLeftHandler" @click-right="clickRightHandler">
      <van-icon name="user-o" slot="left" :size="'20px'"/>
      <van-icon name="home-o" slot="right" :size="'20px'"/>
    </van-nav-bar>
  </div>
</template>

<script>
import { VerifyEmail } from '@/api/user'
import { UpdatePrincipal } from '../api/user';
import {mapGetters} from 'vuex';
export default {
  name: 'Verify',
  data () {
    return {

    }
  },
  computed: {
    ...mapGetters([
      'user'
    ])
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
          if (res.data === 20102) {
            // 已验证
            this.$router.push({ path: '/fileList' })
          } else {
            this.setInterval()
            if (this.user) {
              this.updatePrincipal()
            }
          }
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
    },
    updatePrincipal () {
      UpdatePrincipal().then(res => {
        this.$store.dispatch('getInfo')
      })
    }
  },
  mounted () {
    this.verifyEmail()
  }
}
</script>

<style scoped>
</style>
