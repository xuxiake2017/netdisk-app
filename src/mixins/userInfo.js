import { GetInfo } from '@/api/user'

export default {
  methods: {
    // 获取用户信息（储存空间）并储存
    getInfo () {
      GetInfo().then(res => {
        this.$store.commit('storeUser', res.data)
      }).catch(res => {})
    }
  }
}
