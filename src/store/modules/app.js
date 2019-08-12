export default {
  state: {
    clientHeight: null,
    clientWidth: null,
    networkStatus: true
  },
  mutations: {
    setClientHeight (state, val) {
      state.clientHeight = val
    },
    setClientWidth (state, val) {
      state.clientWidth = val
    },
    setNetworkStatus (state, val) {
      state.networkStatus = val
    }
  },
  getters: {
    clientWidth: state => state.clientWidth,
    clientHeight: state => state.clientHeight,
    networkStatus: state => state.networkStatus
  }
}
