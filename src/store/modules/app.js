export default {
  state: {
    clientHeight: null
  },
  mutations: {
    setClientHeight (state, val) {
      state.clientHeight = val
    }
  },
  getters: {
    clientHeight: state => state.clientHeight
  }
}
