<template>
  <div>
    <van-nav-bar :title="title" :fixed="true" @click-left="clickLeftHandler" @click-right="clickRightHandler">
      <van-icon name="home-o" slot="right" :size="'20px'"/>
      <img :src="user.avatar" class="avatar-top" slot="left"/>
    </van-nav-bar>
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import util from '../utils/util'
import Cookies from 'js-cookie'
import { GetShareFile, CheckPwd, GetSubList, SaveToCloud } from '../api/share'
export default {
  name: 'AccessShareFile',
  data () {
    return {
      fileIoc: '',
      shareFile: {
        fileId: 0,
        fileRealName: '',
        fileSaveName: '',
        fileSize: null,
        fileType: 0,
        isDir: 0,
        shareId: '',
        sharePwd: '',
        shareTime: null,
        shareUser: ''
      },
      pwdDialogVisible: false,
      fileList: null,
      listLoading: false,
      pathStore: [
        {parentId: null, fileRealName: '全部文件'}
      ]
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
      GetSubList({shareId: this.shareFile.shareId, sharePwd: this.shareFile.sharePwd, parentId}).then(res => {
        this.fileList = res.data.files
      })
    }
  },
  mounted () {
    this.shareFile.shareId = this.$route.params.shareId
    if (this.shareFile.shareId) {
      this.getShareFile()
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .avatar-top {
    width: 30px;
    height: 30px;
    border-radius: 15px;
    box-shadow:1px 1px 3px #333333;
  }
</style>
