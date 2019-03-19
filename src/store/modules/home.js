export default {
  state: {
    // 是否显示侧边栏
    popupShow: false
  },
  mutations: {
    togglePopup (state, val) {
      state.popupShow = val
    },
    // 关闭侧边栏
    closePopup (state) {
      state.popupShow = false
    },
    // 打开侧边栏
    openPopup (state) {
      state.popupShow = true
    }
  },
  actions: {},
  getters: {
    popupShow: state => state.popupShow
  }
}
