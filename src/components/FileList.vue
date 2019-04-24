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
          :on-success="onSuccess"
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
          <van-row gutter="20">
            <van-col>
              上传时间：{{formatFileTime(item, index)}}
            </van-col>
            <van-col v-if="item.isDir">
              文件大小：{{formatFileSize(item, index)}}
            </van-col>
          </van-row>
          <van-row style="margin-top: 5px">
            <van-button size="mini" type="danger" @click="deleteHandler(item, index)">删除</van-button>
            <van-button v-if="item.isDir" size="mini" type="primary" @click="downloadHandler(item)">下载</van-button>
            <van-button size="mini" type="warning" @click="renameHandler(item)">重命名</van-button>
            <van-button size="mini" type="default" @click="mvFileHandler(item, index)">移动</van-button>
            <van-button size="mini" type="info" @click="shareFileHandler(item, index)">分享</van-button>
          </van-row>
        </van-collapse-item>
      </van-collapse>
    </van-list>
    <!--新建文件夹、重命名对话框-->
    <van-dialog
      v-model="show"
      show-cancel-button
      :before-close="beforeClose"
    >
      <div v-if="action === 'rename'">
        <div class="van-dialog__header">
          <span>重命名</span>
        </div>
        <van-field
          style="margin: 10px 0"
          v-model="newFileName"
          placeholder="请输入文件名"
        />
      </div>
      <div v-if="action === 'mkdir'">
        <div class="van-dialog__header">
          <span>新建文件夹</span>
        </div>
        <van-field
          style="margin: 10px 0"
          v-model="newDir"
          placeholder="请输入文件夹名"
        />
      </div>
      <div v-if="action === 'mvfile'">
        <div class="van-dialog__header">
          <span>移动文件</span>
        </div>
        <el-tree
          style="margin: 5px 5px;"
          v-if="hackReset"
          highlight-current
          :default-expanded-keys="[-1]"
          check-on-click-node
          ref="tree"
          :lazy="true"
          :load="loadChildTree"
          accordion
          :data="dirs"
          node-key="id"
          :expand-on-click-node="false">
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <van-icon name="my-dir"/>
            <span>{{ node.label }}</span>
          </span>
        </el-tree>
      </div>
    </van-dialog>
    <!--分享文件对话框-->
    <van-dialog
      v-model="shareFileDialogShow"
      :show-confirm-button="false">
      <div class="van-dialog__header">
        <span>分享成功</span>
      </div>
      <van-row class="van-dialog__message van-dialog__message--has-title" style="text-align: left">
        {{message}}
      </van-row>
      <button class="van-button van-button--default van-button--large van-dialog__confirm" id="clipBoardBtn" :data-clipboard-text="clipboardText" @click="cipboard">
        <span class="van-button__text">确认</span>
      </button>
    </van-dialog>
    <media-preview
      :show="mediaPopupShow"
      :mediaFile="mediaFile"
      @media-popup-close="mediaPopupClose">
    </media-preview>
    <!--固定定位的新建文件夹按钮-->
    <div class="mkdir-suspend-btn" @click="mkdirHandler">
      <van-icon name="my-mkdir" :size="'25px'"/>
    </div>
  </div>
</template>

<script>
import { GetFileList, UploadMD5, ListAllDir, MkDir, MoveFile, DeleteFile, ReName } from '@/api/file'
import { ShareFile } from '@/api/share'
import GetFileMD5 from '@/utils/getFileMD5'
import util from '@/utils/util'
import usermixin from '@/mixins/userInfo'
import mediaPreview from '@/mixins/mediaPreview'
import { mapGetters } from 'vuex'
import ClipBoard from 'clipboard'
export default {
  name: 'FileList',
  mixins: [usermixin, mediaPreview],
  data () {
    return {
      // 储存文件树路径
      pathStore: [
        {parentId: -1, fileRealName: '全部文件'}
      ],
      // 查询过滤条件
      filters: {
        parentId: -1,
        fileRealName: ''
      },
      // 分页参数
      pagination: {
        total: 0,
        pageNum: 0,
        pageSize: 20
      },
      // 文件列表
      fileList: [],
      loading: false,
      finished: false,
      activeNames: [],
      disabled: false,
      // 重命名
      renameRow: null,
      newFileName: '',
      // 文件上传
      uploadData: {
        parentId: -1,
        md5Hex: '',
        lastModifiedDate: null
      },
      uploadLimit: 1,
      uploadAction: `${process.env.BASE_API}/file/fileUpload`,
      // 管理对话框
      show: false,
      action: '',
      // 新建文件夹
      newDir: '',
      // 文件移动
      mvfileShow: false,
      // 用于树组件的销毁
      hackReset: false,
      dirs: [],
      movedFileSaveName: '',
      movedId: 0,
      // 文件分享
      message: '',
      clipboardText: '',
      shareFileDialogShow: false
    }
  },
  computed: {
    uploadPopupShow: {
      get () {
        return this.$store.getters.uploadPopupShow
      },
      set (val) {
        this.$store.commit('toggleUploadPopup', val)
      }
    },
    ...mapGetters([
      'user'
    ])
  },
  methods: {
    fileIcoFilter (row) {
      return util.fileIcoFilter(row.fileType)
    },
    // 文件名过长截取
    formatFileName (row) {
      return util.formatFileName(row.fileRealName, row.isDir)
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
      }).catch(res => {
        this.loading = false
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
        switch (item.fileType) {
          case this.$NetdiskConstant.FILE_TYPE_OF_DIR:
            this.getSubFileList(item)
            break
          case this.$NetdiskConstant.FILE_TYPE_OF_PIC:
            this.imagePreview(item)
            break
          case this.$NetdiskConstant.FILE_TYPE_OF_VIDEO:
            this.mediaPreview(item)
            break
          case this.$NetdiskConstant.FILE_TYPE_OF_MUSIC:
            this.mediaPreview(item)
            break
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
          this.getInfo();
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
      this.action = 'rename'
      this.renameRow = item
      this.newFileName = item.fileRealName.substring(0, item.isDir && item.fileExtName ? item.fileRealName.lastIndexOf('.') : item.fileRealName.length)
      this.show = true;
    },
    reName (done) {
      ReName({
        parentId: this.filters.parentId,
        fileSaveName: this.renameRow.fileSaveName,
        fileRealName: this.newFileName + (this.renameRow.fileType === 0 ? '' : ('.' + this.renameRow.fileExtName)),
        isDir: this.renameRow.isDir
      }).then(res => {
        this.$toast.success('文件重命名成功！')
        done()
        this.reLoad()
        this.newFileName = ''
      }).catch(res => {
        done(false)
      })
    },
    mkdirHandler () {
      this.action = 'mkdir'
      this.show = true
    },
    mkDir (done) {
      MkDir({fileRealName: this.newDir, parentId: this.filters.parentId}).then(res => {
        this.$toast.success(`文件夹"${this.newDir}"新建成功！`)
        this.reLoad()
        this.newDir = ''
        done()
      }).catch(res => {
        done(false)
      })
    },
    // 验证文件（夹）名是否合法
    verifyFileName (fileName) {
      const reg1 = /^[^ ,./\\][\S]{0,20}$/
      if (!reg1.test(fileName)) {
        return false
      }
      const reg2 = /[/\\]+/
      if (reg2.test(fileName)) {
        return false
      }
      return true
    },
    beforeClose (action, done) {
      switch (this.action) {
        case 'rename':
          if (action === 'confirm') {
            if (this.newFileName) {
              if (this.verifyFileName(this.newFileName)) {
                this.reName(done)
              } else {
                this.$toast('文件名不合法！')
                done(false)
              }
            } else {
              this.$toast('文件名不能为空！')
              done(false)
            }
          } else {
            done()
          }
          break
        case 'mkdir':
          if (action === 'confirm') {
            if (this.newDir) {
              if (this.verifyFileName(this.newDir)) {
                this.mkDir(done)
              } else {
                this.$toast('文件夹名不合法！')
                done(false)
              }
            } else {
              this.$toast('文件夹名不能为空！')
              done(false)
            }
          } else {
            done()
            this.newDir = ''
          }
          break
        case 'mvfile':
          if (action === 'confirm') {
            this.mvFile(done)
          } else {
            done()
          }
          break;
        case 'sharefile':
          if (action === 'confirm') {
            this.cipboard(done)
          } else {
            done()
          }
      }
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
      const user = this.user
      const availableMemory = user.availableMemory
      if (file.size > availableMemory) {
        this.$toast.fail('剩余空间不足，请删除部分文件再试');
        throw new Error('剩余空间不足，请删除部分文件再试');
      }
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
          this.getInfo()
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
    // 文件上传成功时的钩子
    onSuccess (response, file, fileList) {
      this.getInfo()
    },
    // 文件手动上传
    submitUpload () {
      this.$refs.upload.submit();
    },
    uploadPopupCloseHandler () {
      this.$refs.upload.clearFiles();
      this.$store.commit('clearFile')
      this.reLoad()
    },
    // 文件移动
    // 查询所有文件夹
    listAllDir (parentId, resolve) {
      ListAllDir({parentId}).then(res => {
        let nodes = []
        res.data.forEach((value, index) => {
          let node = {}
          node['id'] = value.id
          node['label'] = value.fileRealName
          nodes.push(node)
        })
        resolve(nodes)
      })
    },
    // 树的加载函数
    loadChildTree (node, resolve) {
      if (!node.key) {
        let nodes = []
        let node_ = {}
        node_['id'] = -1
        node_['label'] = '/'
        nodes.push(node_)
        resolve(nodes)
      } else {
        if (this.movedId === node.key) {
          this.$toast('不能移动到自身及其子目录！')
          resolve([])
        } else {
          this.listAllDir(node.key, resolve)
        }
      }
    },
    // 打开文件移动对话框
    mvFileHandler (row, index) {
      this.action = 'mvfile'
      this.movedFileSaveName = row.fileSaveName
      this.movedId = row.id
      this.show = true
      this.hackReset = false;// 销毁组件
      this.$nextTick(() => {
        this.hackReset = true;// 重建组件
      });
    },
    // 文件分享
    shareFileHandler (row, index) {
      ShareFile({ fileSaveName: row.fileSaveName }).then(res => {
        this.shareFileDialogShow = true
        this.clipboardText = `链接：${res.data.serverHost}/#/home/s/${res.data.shareFile.shareId} 密码：${res.data.shareFile.sharePwd}`
        this.message = `文件分享成功，点击"确定"复制链接及密码（${this.clipboardText}）`
      })
    },
    // 复制到剪贴板
    cipboard (done) {
      let clipboard_ = new ClipBoard('#clipBoardBtn')
      clipboard_.on('success', () => {
        this.$toast('复制成功！')
        this.shareFileDialogShow = false
      })
      clipboard_.on('error', () => {
        this.$toast('复制失败，请手动选择复制！')
      })
    },
    // 移动文件
    mvFile (done) {
      let parentId = this.$refs.tree.getCurrentKey()
      if (!parentId) {
        this.$toast('请选择文件夹！')
        done(false)
        return
      }
      if (this.movedId === parentId) {
        this.$toast('不能移动到自身及其子目录！')
        done(false)
      } else {
        MoveFile({parentId: parentId, fileSaveName: this.movedFileSaveName}).then(res => {
          done()
          this.$toast.success(`文件移动成功！`)
          this.mvfileShow = false
          this.reLoad()
        }).catch(res => {
          done(false)
        })
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "../styles/common";
  .mkdir-suspend-btn {
    width: 30px;
    height: 30px;
    border-radius: 15px;
    box-shadow:1px 1px 3px #333333;
    background-color: #FFFFFF;
    position: fixed;
    bottom: 20px;
    right: 20px;
    text-align: center;
    line-height: 30px;
  }
</style>
