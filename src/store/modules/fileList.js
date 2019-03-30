export default {
  state: {
    // 储存待上传的文件
    fileList: [],
    // 上传模态框标记
    uploadPopupShow: false
  },
  mutations: {
    storeFile (state, file) {
      state.fileList.push(file)
      console.log(state.fileList)
    },
    delFile (state, uid) {
      let i = null
      state.fileList.forEach((file, index) => {
        if (uid === file.uid) {
          i = index
        }
      })
      state.fileList.splice(i, 1)
    },
    clearFile (state) {
      state.fileList.length = 0
    },
    toggleUploadPopup (state, val) {
      state.uploadPopupShow = val
    }
  },
  actions: {},
  getters: {
    'getFileList': state => state.fileList,
    'getFile': (state) => (uid) => {
      return state.fileList.find(file => file.uid === uid)
    },
    uploadPopupShow: state => state.uploadPopupShow
  }
}
