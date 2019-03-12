<template>
  <div class="float-left">
    <van-nav-bar title="文件列表" left-text="返回" left-arrow :fixed="true">
      <van-icon name="search" slot="right" />
    </van-nav-bar>
    <div class="nav">
      <van-row class="breadcrumb">
        <van-col class="breadcrumb-item" v-for="(item, index) in pathStore">
          <a href="" @click.prevent="jump(item, index)">{{item.fileRealName}}</a>
          <span>/</span>
        </van-col>
      </van-row>
    </div>
    <!--<van-nav-bar title="标题" left-text="返回" left-arrow :fixed="true">-->
      <!--<van-icon name="search" slot="right" />-->
    <!--</van-nav-bar>-->
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
          @click.native="fn($event, item, index)">
          <div slot="title">
            <van-row>
              <van-col>
                <img :src="fileIcoFilter(item)"/>
              </van-col>
              <van-col offset="1">
                {{item.fileRealName}}
              </van-col>
            </van-row>
          </div>
          <van-row>
            上传时间：{{formatFileTime(item, index)}}
          </van-row>
          <van-row style="margin-top: 5px">
            <van-button size="mini" type="danger" @click="deleteHandler(item)">删除</van-button>
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
import { GetFileList } from '@/api/file'
import util from '@/utils/util'
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
      newFileName: ''
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
      }, 300)
    },
    getSubFileList (item) {
      this.filters.parentId = item.id
      this.loading = true
      this.finished = false
      this.fileList = []
      this.pagination.pageNum = 0
      this.pathStore.push({parentId: item.id, fileRealName: item.fileRealName})
      this.onLoad()
    },
    // 文件路径跳转
    jump (item, index) {
      if ((this.pathStore.length === 1) || (this.pathStore.length > 1 && index + 1 === this.pathStore.length)) {
        return
      }
      this.pathStore.splice(index + 1, this.pathStore.length - 1)
      this.filters.parentId = item.parentId
      this.loading = true
      this.finished = false
      this.fileList = []
      this.pagination.pageNum = 0
      this.getFileList()
    },
    fn (event, item, index) {
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
    deleteHandler (item) {
      this.$dialog.confirm({
        title: '提示',
        message: '确认删除？'
      }).then(res => {
        // 删除
        console.log(item)
      }).catch(res => {
        // 取消
      })
    },
    downloadHandler (item) {
      window.open(`${process.env.BASE_API}/file/downLoad?fileSaveName=${item.fileSaveName}`, '_blank');
    },
    renameHandler (item) {
      this.renameRow = item
      this.newFileName = this.renameRow.fileRealName
      this.show = true;
    },
    beforeClose (action, done) {
      console.log(action)
      done()
    }
  }
}
</script>

<style scoped>
  .float-left {
    text-align: left;
  }
  .nav {
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
  /*.nav::after {*/
    /*content: ' ';*/
    /*position: absolute;*/
    /*pointer-events: none;*/
    /*-webkit-box-sizing: border-box;*/
    /*box-sizing: border-box;*/
    /*top: -50%;*/
    /*left: -50%;*/
    /*right: -50%;*/
    /*bottom: -50%;*/
    /*-webkit-transform: scale(.5);*/
    /*transform: scale(.5);*/
    /*border: 0 solid #ebedf0;*/
  /*}*/
</style>
