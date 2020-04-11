<template>
  <div>
    <van-nav-bar :title="title" :fixed="true" @click-left="clickLeftHandler" @click-right="clickRightHandler" class="home-nav-bar">
      <van-icon name="home-o" slot="right" :size="'20px'"/>
      <img :src="shareFile.avatar" class="avatar-top" slot="left"/>
    </van-nav-bar>
    <div class="my-nav">
      <van-row class="breadcrumb">
        <van-col class="breadcrumb-item" v-for="(item, index) in pathStore" :key="index">
          <a href="" @click.prevent="jump(item, index)">{{item.fileRealName}}</a>
          <span>/</span>
        </van-col>
      </van-row>
    </div>
    <div style="margin-top: 75px; text-align: left;">
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
          <van-row gutter="20">
            <van-col>
              上传时间：{{formatFileTime(item, index)}}
            </van-col>
            <van-col v-if="item.isDir">
              文件大小：{{formatFileSize(item, index)}}
            </van-col>
          </van-row>
          <van-row style="margin-top: 5px">
            <van-button v-if="item.isDir" size="mini" type="primary" @click="handleDownload(index, item)">下载</van-button>
            <van-button size="mini" type="warning" @click="handleSaveToCloud(index, item)" style="width: 70px">保存到网盘</van-button>
          </van-row>
        </van-collapse-item>
      </van-collapse>
    </div>
    <van-dialog
      v-model="pwdDialogVisible"
      :title="`'${shareFile.shareUser}'给您加密分享了文件`"
      show-cancel-button
      :before-close="beforeClose"
    >
      <van-field
        style="margin: 10px 0"
        v-model="shareFile.sharePwd"
        placeholder="请输入提取密码"
      />
    </van-dialog>
    <media-preview
      :show="mediaPopupShow"
      :mediaFile="mediaFile"
      @media-popup-close="mediaPopupClose">
    </media-preview>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import util from '../utils/util'
import Cookies from 'js-cookie'
import { GetShareFile, CheckPwd, GetSubList, SaveToCloud } from '../api/share'
import mediaPreview from '@/mixins/mediaPreview'
export default {
  name: 'AccessShareFile',
  mixins: [mediaPreview],
  data () {
    return {
      fileIoc: '',
      shareFile: {
        fileId: 0,
        fileName: '',
        fileKey: '',
        fileSize: null,
        fileType: 0,
        isDir: 0,
        shareId: '',
        sharePwd: '',
        shareTime: null,
        shareUser: '',
        avatar: ''
      },
      pwdDialogVisible: false,
      // 文件列表
      fileList: null,
      // 储存文件树路径
      pathStore: [
        {parentId: null, fileRealName: '全部文件'}
      ],
      activeNames: [],
      disabled: false
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ]),
    title: {
      get () {
        return `'${this.shareFile.shareUser}'的分享`
      }
    }
  },
  methods: {
    clickLeftHandler () {

    },
    clickRightHandler () {
      this.$router.push({ path: '/fileList' })
    },
    getShareFile () {
      GetShareFile({ shareId: this.shareFile.shareId }).then(res => {
        this.shareFile = res.data
        this.fileIoc = util.fileIcoFilter(this.shareFile.fileType)
        let shareId = Cookies.get('shareId')
        let sharePwd = Cookies.get('sharePwd')
        if (shareId === this.shareFile.shareId) {
          if (sharePwd) {
            this.shareFile.sharePwd = sharePwd
            this.getSublist()
          } else {
            this.pwdDialogVisible = true
          }
        } else {
          Cookies.remove('shareId')
          Cookies.remove('sharePwd')
          this.pwdDialogVisible = true
        }
      }).catch(res => {
        this.$router.push({ path: '/404' })
      })
    },
    beforeClose (action, done) {
      if (action === 'confirm') {
        this.verifyPwd(done)
      }
      if (action === 'cancel') {
        done()
      }
    },
    verifyPwd (done) {
      if (!this.shareFile.sharePwd) {
        this.$toast('请输入提取密码再提交！')
        done(false)
      } else {
        CheckPwd({shareId: this.shareFile.shareId, sharePwd: this.shareFile.sharePwd}).then(res => {
          done()
          Cookies.set('shareId', this.shareFile.shareId)
          Cookies.set('sharePwd', this.shareFile.sharePwd)
          this.getSublist()
        }).catch(res => {
          done(false)
        })
      }
    },
    // 查询子目录
    getSublist (parentId) {
      this.closeAllCollapse()
      GetSubList({shareId: this.shareFile.shareId, sharePwd: this.shareFile.sharePwd, parentId}).then(res => {
        this.fileList = res.data.files
      })
    },
    getSublistClick (item) {
      this.pathStore.push({parentId: item.id, fileRealName: item.fileName})
      this.getSublist(item.id)
    },
    fileIcoFilter (row) {
      return util.fileIcoFilter(row.fileType)
    },
    // 文件名过长截取
    formatFileName (row) {
      return util.formatFileName(row.fileName, row.isDir)
    },
    // 格式化文件大小
    formatFileSize (row, column) {
      return util.formatFileSize(row.fileSize)
    },
    // 格式化文件时间
    formatFileTime (row, column) {
      return util.formatDate.format(new Date(row.updateTime), 'yyyy-MM-dd hh:mm:ss')
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
        const {shareId, sharePwd} = this.shareFile
        switch (item.fileType) {
          case this.$NetdiskConstant.FILE_TYPE_OF_DIR:
            this.getSublistClick(item)
            break
          case this.$NetdiskConstant.FILE_TYPE_OF_PIC:
            this.imagePreview({shareId, sharePwd, fileId: item.id})
            break
          case this.$NetdiskConstant.FILE_TYPE_OF_VIDEO:
          case this.$NetdiskConstant.FILE_TYPE_OF_MUSIC:
            this.mediaPreview({shareId, sharePwd, fileId: item.id})
            break
        }
      } else {
        this.$refs.vanCollapse.switch(index, !$vanCollapseItem.expanded)
      }
    },
    // 文件路径跳转
    jump (item, index) {
      if ((this.pathStore.length === 1) || (this.pathStore.length > 1 && index + 1 === this.pathStore.length)) {
        return
      }
      this.pathStore.splice(index + 1, this.pathStore.length - 1)
      this.getSublist(item.parentId)
    },
    // 关闭所有折叠面板
    closeAllCollapse () {
      this.activeNames.splice(0)
    },
    // 下载
    handleDownload (index, row) {
      if (row) {
        window.open(`${process.env.BASE_API}/share/download?shareId=${this.shareFile.shareId}&sharePwd=${this.shareFile.sharePwd}&fileId=${row.id}`, '_blank')
      } else {
        window.open(`${process.env.BASE_API}/share/download?shareId=${this.shareFile.shareId}&sharePwd=${this.shareFile.sharePwd}`, '_blank')
      }
    },
    // 保存到网盘
    handleSaveToCloud (index, row) {
      let param = {}
      if (index && row) {
        param = {shareId: this.shareFile.shareId, sharePwd: this.shareFile.sharePwd, fileId: row.id}
      } else {
        param = {shareId: this.shareFile.shareId, sharePwd: this.shareFile.sharePwd}
      }
      SaveToCloud({ ...param }).then(res => {
        this.$toast(res.msg)
        this.$store.dispatch('getInfo')
      }).catch(res => {
        if (res.data.code === 20141) {
          window.setTimeout(() => {
            this.$router.push({ path: '/login' })
          }, 1000)
        }
      })
    }
  },
  mounted () {
    this.previewFlag = 2
    this.shareFile.shareId = this.$route.params.shareId
    if (this.shareFile.shareId) {
      this.getShareFile()
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "../styles/common";
  .avatar-top {
    width: 30px;
    height: 30px;
    border-radius: 15px;
    box-shadow:1px 1px 3px #333333;
  }
</style>
