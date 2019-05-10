export default {
  state: {
    // 添加好友上拉列表显示标记
    addActionSheetShow: false
  },
  mutations: {
    toggleAddActionSheetShow (state, val) {
      state.addActionSheetShow = val
    }
  },
  actions: {},
  getters: {
    addActionSheetShow: state => state.addActionSheetShow
  }
}
