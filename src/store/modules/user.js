import { removeToken } from '@/utils/auth'
import { GetInfo } from '@/api/user'
export default {
  state: {
    // 登录的用户信息
    user: null,
    // 好友map
    friendMap: new Map()
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
      // if (!state.friendMap) {
      //   state.friendMap = new Map()
      // }
      state.friendMap.set(val.friendId, val)
    }
  },
  actions: {
    getInfo ({ commit, state }) {
      return new Promise((resolve, reject) => {
        // 获取用户信息（储存空间）并储存
        GetInfo().then(res => {
          commit('storeUser', res.data)
          res.data.friendList.forEach(item => {
            commit('setFriend', item)
          })
          resolve()
        }).catch((res) => {
          reject(res)
        })
      })
    }
  },
  getters: {
    user: state => state.user,
    friendMap: state => state.friendMap
  }
}
