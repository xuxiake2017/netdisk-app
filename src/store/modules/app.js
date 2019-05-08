export default {
  state: {
    clientHeight: null,
    clientWidth: null
  },
  mutations: {
    setClientHeight (state, val) {
      state.clientHeight = val
    },
    setClientWidth (state, val) {
      state.clientWidth = val
    }
  },
  getters: {
    clientWidth: state => state.clientWidth,
    clientHeight: state => state.clientHeight
  }
}
