<template>
  <div>
    <van-nav-bar
      title="选择文件"
      left-text="关闭"
      :fixed="true"
      @click-left="chatFileListPopupClose">
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
      v-model="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
      style="margin-top: 75px;"
      :style="{'height': `${clientHeight / 2 - 75}px`}"
      class="file-list"
    >
      <van-cell v-for="(item, index) in fileList" :key="index" @click="fileClickHandler(item)">
        <template slot="title">
          <van-row>
            <van-col>
              <img :src="fileIcoFilter(item)"/>
            </van-col>
            <van-col offset="1">
              {{formatFileName(item)}}
            </van-col>
          </van-row>
        </template>
      </van-cell>
    </van-list>
  </div>
</template>

<script>
import { GetFileList } from '@/api/file'
import util from '@/utils/util'
export default {
  name: 'ChatFileList',
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
      finished: false
    }
  },
  props: {
  },
  methods: {
    chatFileListPopupClose () {
      this.$emit('chat-file-list-popup-close')
    },
    fileIcoFilter (row) {
      return util.fileIcoFilter(row.fileType)
    },
    // 文件名过长截取
    formatFileName (row) {
      return util.formatFileName(row.fileRealName, row.isDir)
    },
    getFileList () {
      this.pagination.pageNum++
      GetFileList({ ...this.filters, ...this.pagination }).then(res => {
        // 加载状态结束
        this.loading = false
        this.fileList.push(...res.data.pageInfo.list)
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
    // 数据重新加载
    reLoad () {
      this.loading = true
      this.finished = false
      this.fileList = []
      this.pagination.pageNum = 0
      this.onLoad()
    },
    fileClickHandler (item) {
      if (this.loading) {
        return
      }
      if (!item.isDir) {
        this.filters.parentId = item.id
        this.reLoad()
        this.pathStore.push({parentId: item.id, fileRealName: item.fileRealName})
      } else {
        this.$dialog.confirm({
          title: '提示',
          message: `确认发送文件《${item.fileRealName}》？`
        }).then(res => {
          this.$emit('select-file', item)
        }).catch(res => {
          // 取消
        })
      }
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
    }
  },
  computed: {
    clientHeight: {
      get () {
        return this.$store.getters.clientHeight
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "../styles/common";
  .file-list {
    overflow-x: hidden;
    overflow-y: auto;
  }
</style>
