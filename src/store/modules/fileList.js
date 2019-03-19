export default {
  state: {
    // 储存待上传的文件
    fileList: []
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
    }
  },
  actions: {},
  getters: {
    'getFileList': state => state.fileList,
    'getFile': (state) => (uid) => {
      return state.fileList.find(file => file.uid === uid)
    }
  }
}
