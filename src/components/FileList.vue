<template>
  <div class="float-left">
    <van-list
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
            <van-button size="mini" type="danger">删除</van-button>
            <van-button size="mini" type="primary">下载</van-button>
            <van-button size="mini" type="warning">重命名</van-button>
          </van-row>
        </van-collapse-item>
      </van-collapse>

      <!--<van-cell value="内容" icon="shop-o" is-link>
        <template slot="title">
          <span class="custom-text">单元格</span>
          <van-tag type="danger">标签</van-tag>
        </template>
      </van-cell>
      <van-cell
        v-for="item in list"
        :key="item"
        :title="item"
      />-->
    </van-list>
  </div>
</template>

<script>
import $ from 'jquery'
import { GetFileList } from '@/api/file'
import util from '@/utils/util'
export default {
  name: 'FileList',
  data () {
    return {
      pagination: {
        total: 0,
        pageNum: 1,
        pageSize: 20
      },
      fileList: [],
      loading: false,
      finished: false,
      activeNames: [],
      disabled: false
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
      GetFileList({ ...this.pagination }).then(res => {
        this.fileList = res.data.pageInfo.list
        this.pagination.pageNum = res.data.pageInfo.pageNum
        console.log(this.fileList)
      })
    },
    onLoad () {
      // 异步更新数据
      setTimeout(() => {
        this.getFileList()
        // 加载状态结束
        this.loading = false

        // 数据全部加载完成
        if (this.pagination.pageNum * this.pagination.pageSize > this.fileList.length) {
          this.finished = true
        }
      }, 500)
    },
    fn (event, item, index) {
      console.log(event.srcElement.className)
      console.log(item)
      console.log(index)
      const className = event.srcElement.className
      const $vanCollapseItem = this.$refs.vanCollapse.items.find(item => {
        return index === item.name
      })
      console.log($vanCollapseItem)
      if (className.indexOf('van-cell__right-icon') !== -1) {
        console.log($vanCollapseItem.expanded)
        this.$refs.vanCollapse.switch(index, $vanCollapseItem.expanded)
        console.log($vanCollapseItem.expanded)
      } else if (className.indexOf('van-button') !== -1) {
      } else {
        console.log($vanCollapseItem.expanded)
        this.$refs.vanCollapse.switch(index, !$vanCollapseItem.expanded)
        console.log($vanCollapseItem.expanded)
      }
      // this.disabled = false
      // console.log(event)
      // console.log(event.path[0])
      // const className = $(event.path[0]).prop('className')
      // if (className.indexOf('van-cell__right-icon') !== -1) {
      //   this.$refs.vanCollapseItem.parent.switch(this.$refs.vanCollapseItem.name, this.$refs.vanCollapseItem.expanded)
      // } else if (className.indexOf('van-button') !== -1) {
      // } else {
      //   this.$refs.vanCollapseItem.parent.switch(this.$refs.vanCollapseItem.name, !this.$refs.vanCollapseItem.expanded)
      // }
    },
    deleteHandler () {
    },
    downloadHandler () {
    }
  }
}
</script>

<style scoped>
  .float-left {
    text-align: left;
  }
</style>
