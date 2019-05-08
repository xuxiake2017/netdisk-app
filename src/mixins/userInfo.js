import { GetInfo } from '@/api/user'

export default {
  methods: {
    // 获取用户信息（储存空间）并储存
    getInfo () {
      GetInfo().then(res => {
        this.$store.commit('storeUser', res.data)
        res.data.friendList.forEach(item => {
          this.$store.commit('setFriend', item)
        })
      }).catch(res => {})
    }
  }
}
