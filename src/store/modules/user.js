import { removeToken } from '@/utils/auth'
export default {
  state: {
    // 登录的用户信息
    user: null,
    // 好友map
    friendMap: null
  },
  mutations: {
    storeUser (state, user) {
      state.user = user
    },
    delUser (state) {
      // state.user = null
      removeToken()
    },
    clearMessages (state) {
      state.user.messages = []
    },
    setFriend (state, val) {
      if (!state.friendMap) {
        state.friendMap = new Map()
      }
      state.friendMap.set(val.friendId, val)
    }
  },
  actions: {},
  getters: {
    user: state => state.user,
    friendMap: state => state.friendMap
  }
}
