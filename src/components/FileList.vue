<template>
  <div>
    <van-popup v-model="uploadPopupShow" position="bottom" style="width: 100%; height: 50%;" @click-overlay="uploadPopupCloseHandler">
      <van-row style="margin: 10px 10px;">
        <el-upload
          ref="upload"
          :action="uploadAction"
          :before-remove="beforeRemove"
          :before-upload="beforeUpload"
          :on-preview="handlePreview"
          :on-change="onFileChange"
          :with-credentials="true"
          :auto-upload="false"
          :limit="uploadLimit"
          :on-exceed="handleExceed"
          :data="uploadData">
          <el-button size="small" type="primary" slot="trigger">点击选择</el-button>
          <el-button size="small" type="success" @click="submitUpload">上传到服务器</el-button>
          <div slot="tip" class="el-upload__tip">只支持单个文件上传，文件大小不能超过100M</div>
        </el-upload>
      </van-row>
    </van-popup>
    <van-nav-bar :title="title" :fixed="true" @click-left="openPopup" @click-right="openUploadPopup">
      <van-icon name="my-fileupload" slot="right" :size="'20px'"/>
      <img :src="user.avatar" class="avatar-top" slot="left"/>
    </van-nav-bar>
    <div class="my-nav">
      <van-row class="breadcrumb">
        <van-col class="breadcrumb-item" v-for="(item, index) in pathStore" :key="index">
          <a href="" @click.prevent="jump(item, index)">{{item.fileRealName}}</a>
          <span>/</span>
        </van-col>
      </van-row>
    </div>
    <van-list
      style="margin-top: 75px;"
      v-model="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <van-collapse
        v-model="activeNames"
        ref="vanCollapse"
        :accordion="false">

        <van-collapse-item
          v-for="(item, index) in fileList"
          :key="index"
          :name="index"
          :disabled="disabled"
          @click.native="clickHandler($event, item, index)">
          <div slot="title">
            <van-row>
              <van-col>
                <img :src="fileIcoFilter(item)"/>
              </van-col>
              <van-col offset="1">
                {{formatFileName(item)}}
              </van-col>
            </van-row>
          </div>
          <van-row>
            上传时间：{{formatFileTime(item, index)}}
          </van-row>
          <van-row style="margin-top: 5px">
            <van-button size="mini" type="danger" @click="deleteHandler(item, index)">删除</van-button>
            <van-button v-if="item.isDir" size="mini" type="primary" @click="downloadHandler(item)">下载</van-button>
            <van-button size="mini" type="warning" @click="renameHandler(item)">重命名</van-button>
          </van-row>
        </van-collapse-item>
      </van-collapse>
    </van-list>
    <van-dialog
      v-model="show"
      show-cancel-button
      :before-close="beforeClose"
    >
      <van-field
        style="margin: 10px 0"
        v-model="newFileName"
        placeholder="请输入文件名"
      />
    </van-dialog>
  </div>
</template>

<script>
import { GetFileList, UploadMD5, DeleteFile, ReName } from '@/api/file'
import GetFileMD5 from '@/utils/getFileMD5'
import util from '@/utils/util'
import { mapGetters } from 'vuex'
export default {
  name: 'FileList',
  data () {
    return {
      pathStore: [
        {parentId: -1, fileRealName: '全部文件'}
      ],
      filters: {
        parentId: -1,
        fileRealName: ''
      },
      pagination: {
        total: 0,
        pageNum: 0,
        pageSize: 20
      },
      fileList: [],
      loading: false,
      finished: false,
      activeNames: [],
      disabled: false,
      show: false,
      renameRow: null,
      newFileName: '',
      uploadPopupShow: false,
      // 文件上传
      uploadData: {
        parentId: -1,
        md5Hex: '',
        lastModifiedDate: null
      },
      uploadLimit: 1,
      uploadAction: `${process.env.BASE_API}/file/fileUpload`
    }
  },
  computed: {
    ...mapGetters([
      'popupShow',
      'user'
    ]),
    title: {
      get () {
        return this.$route.meta.title
      }
    }
  },
  methods: {
    // 显示文件图标
    fileIcoFilter (row) {
      switch (row.fileType) {
        case this.$NetdiskConstant.FILE_TYPE_OF_DIR :
          return require('@/assets/file_ico/Folder_24_e0cacad.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_TXT :
          return require('@/assets/file_ico/Text_24_dd1b3d8.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_WORD :
          return require('@/assets/file_ico/Word_24_1e078ab.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_EXCEL :
          return require('@/assets/file_ico/Excel_24_614e53a.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_POWERPOINT :
          return require('@/assets/file_ico/PPT_24_0af6886.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_PDF :
          return require('@/assets/file_ico/PDF_24_5caf7bf.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_PIC :
          return require('@/assets/file_ico/Picture_24_dd06d30.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_MUSIC :
          return require('@/assets/file_ico/Music_24_04cf4b7.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_VIDEO :
          return require('@/assets/file_ico/Video_24_499ddeb.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_ZIP :
          return require('@/assets/file_ico/ZIP_24_3670294.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_APK :
          return require('@/assets/file_ico/Android_24_a529a3a.png')
        case this.$NetdiskConstant.FILE_TYPE_OF_OTHER :
          return require('@/assets/file_ico/Misc_24_156416f.png')
      }
    },
    formatFileName (row) {
      let fileRealName = row.fileRealName
      let fileExtName = row.fileExtName
      let isDir = row.isDir
      if (fileRealName.length >= 20) {
        if (isDir) {
          fileRealName = `${fileRealName.substring(0, 20)}....${fileExtName}`
        } else {
          fileRealName = `${fileRealName.substring(0, 20)}...`
        }
      }
      return fileRealName
    },
    // 格式化文件大小
    formatFileSize (row, column) {
      return util.formatFileSize(row.fileSize)
    },
    // 格式化文件时间
    formatFileTime (row, column) {
      return util.formatDate.format(new Date(row.uploadTime), 'yyyy-MM-dd hh:mm:ss')
    },
    getFileList () {
      this.pagination.pageNum++
      GetFileList({ ...this.filters, ...this.pagination }).then(res => {
        // 加载状态结束
        this.loading = false
        this.fileList.push(...res.data.pageInfo.list)
        this.closeAllCollapse()
        // this.pagination.pageNum++
      })
    },
    onLoad () {
      // 异步更新数据
      setTimeout(() => {
        // 数据全部加载完成
        if (this.pagination.pageNum * this.pagination.pageSize > this.fileList.length) {
          this.finished = true
          this.loading = false
          return
        }
        this.getFileList()
      }, 150)
    },
    // 关闭所有折叠面板
    closeAllCollapse () {
      this.activeNames.splice(0)
    },
    // 数据重新加载
    reLoad () {
      this.loading = true
      this.finished = false
      this.fileList = []
      this.pagination.pageNum = 0
      this.onLoad()
      this.closeAllCollapse()
    },
    getSubFileList (item) {
      if (this.loading) {
        return
      }
      this.filters.parentId = item.id
      this.reLoad()
      this.pathStore.push({parentId: item.id, fileRealName: item.fileRealName})
    },
    // 文件路径跳转
    jump (item, index) {
      if (this.loading) {
        return
      }
      if ((this.pathStore.length === 1) || (this.pathStore.length > 1 && index + 1 === this.pathStore.length)) {
        return
      }
      this.pathStore.splice(index + 1, this.pathStore.length - 1)
      this.filters.parentId = item.parentId
      this.reLoad()
    },
    // 折叠面板点击事件，拦截展开
    clickHandler (event, item, index) {
      const className = event.srcElement.className
      const $vanCollapseItem = this.$refs.vanCollapse.items.find(item => {
        return index === item.name
      })
      if (className.indexOf('van-cell__right-icon') !== -1) {
        this.$refs.vanCollapse.switch(index, $vanCollapseItem.expanded)
      } else if (className.indexOf('van-button') !== -1) {
      } else if (className.indexOf('van-row') !== -1 || className.indexOf('van-col van-col--offset-1') !== -1) {
        this.$refs.vanCollapse.switch(index, !$vanCollapseItem.expanded)
        if (item.isDir === 0) {
          this.getSubFileList(item)
        }
      } else {
        this.$refs.vanCollapse.switch(index, !$vanCollapseItem.expanded)
      }
    },
    // 文件删除
    deleteHandler (item, index) {
      this.$dialog.confirm({
        title: '提示',
        message: '确认删除？'
      }).then(res => {
        DeleteFile({ fileSaveName: item.fileSaveName }).then(res => {
          this.$toast.success(`删除成功！`)
          this.$refs.vanCollapse.switch(index, false)
          this.reLoad()
        })
      }).catch(res => {
        // 取消
      })
    },
    // 文件下载
    downloadHandler (item) {
      window.open(`${process.env.BASE_API}/file/downLoad?fileSaveName=${item.fileSaveName}`, '_blank');
    },
    // 重命名
    renameHandler (item) {
      this.renameRow = item
      this.newFileName = item.fileRealName.substring(0, item.isDir && item.fileExtName ? item.fileRealName.lastIndexOf('.') : item.fileRealName.length)
      this.show = true;
    },
    beforeClose (action, done) {
      if (action === 'confirm') {
        if (this.newFileName) {
          ReName({
            parentId: this.filters.parentId,
            fileSaveName: this.renameRow.fileSaveName,
            fileRealName: this.newFileName + (this.renameRow.fileType === 0 ? '' : ('.' + this.renameRow.fileExtName)),
            isDir: this.renameRow.isDir
          }).then(res => {
            this.$toast.success('文件重命名成功！')
            done()
            this.reLoad()
          }).catch(res => {
            done(false)
          })
        } else {
          done(false)
        }
      } else {
        done();
      }
    },
    // 打开侧边栏
    openPopup () {
      this.$store.commit('openPopup')
    },
    openUploadPopup () {
      this.uploadPopupShow = true
    },
    // 文件上传
    // 文件数量限制
    handleExceed (files, fileList) {
      this.$toast(`当前限制选择 ${this.uploadLimit} 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
    },
    // 在文件移除之前
    beforeRemove (file, fileList) {
      this.$toast(`移除文件"${file.name}"`);
      this.$store.commit('delFile', file.uid)
      return true
    },
    // 在文件上传之前
    beforeUpload (file) {
      const file_ = this.$store.getters.getFile(file.uid)
      if (!file_) {
        this.$toast.fail('MD5未计算完毕');
        throw new Error('MD5未计算完毕');
      } else {
        this.uploadData.lastModifiedDate = file_.lastModifiedDate
        this.uploadData.md5Hex = file_.md5Hex
        this.uploadData.parentId = this.filters.parentId
      }
      if (file_.isExist) {
        // 服务器已经存在该文件
        UploadMD5(file_).then(res => {
          this.$toast.success(`${file.name}上传成功！`);
        }).catch(res => {
        })
        return false
      } else {
        // 服务器不存在该文件，需要上传
        return true
      }
    },
    handlePreview (file) {
      console.log(file)
    },
    // 文件列表改变时，选择文件后开始计算文件md5值
    onFileChange (file, fileList) {
      if (file.status === 'ready') {
        GetFileMD5(file.raw, file.uid, this.filters.parentId)
      }
    },
    // 文件手动上传
    submitUpload () {
      this.$refs.upload.submit();
    },
    uploadPopupCloseHandler () {
      this.$refs.upload.clearFiles();
      this.$store.commit('clearFile')
      this.reLoad()
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .my-nav {
    top: 46px;
    left: 0;
    width: 100%;
    height: 35px;
    position: fixed;
    background-color: #FFFFFF;
    z-index: 1;
    text-align: center;
    line-height: 1;
    font-size: 14px;
  }
  .breadcrumb {
    margin: 10px 10px;
  }
  .breadcrumb-item {
    margin-left: 5px;
  }
  .avatar-top {
    width: 30px;
    height: 30px;
    border-radius: 15px;
    box-shadow:1px 1px 3px #333333;
  }
</style>
