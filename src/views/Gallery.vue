<template>
  <div class="gallery">
    <div v-if="imgList.length === 0">
      <el-alert title="您的相册空空如也，赶快上传点东西吧" :closable="false"></el-alert>
    </div>
    <van-list
      v-model="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad">
      <div v-for="(item, index) in imgList" :key="index" class="img-cell">
        <el-alert
          :title="item.dayTime"
          :type="alertTypes[index % alertTypes.length]"
          :closable="false">
        </el-alert>
        <img v-for="(item1, j) in item.imgList" :key="j" :style="`background: url('${item1.msrc}') no-repeat center center;`" class="my-img" @click="previewImg(imgList, index, j)">
      </div>
    </van-list>
  </div>
</template>

<script>
import VuePreview from 'vue-preview'
import Vue from 'vue'
import ToImgList from '@/api/img'
import util from '@/utils/util'
import { ImagePreview } from 'vant'

// defalut install
Vue.use(VuePreview)
export default {
  name: 'Gallery',
  data () {
    return {
      imgList: [],
      pagination: {
        pageNum: 0,
        pageSize: 20
      },
      alertTypes: [
        'success',
        'info',
        'warning',
        'error'
      ],
      loading: false,
      finished: false
    }
  },
  methods: {
    handleClose () {
      console.log('close event')
    },
    getImgList () {
      this.pagination.pageNum++
      ToImgList({ ...this.pagination }).then(res => {
        let list = []
        res.data.list.forEach((item, index) => {
          let o1 = {}
          for (let key in item) {
            o1['dayTime'] = util.formatDate.format(new Date(parseInt(key)), 'yyyy年MM月dd日')
            let imgList = []
            item[key].forEach((e) => {
              let o2 = {}
              if (e.fileOrigin.previewUrl) {
                o2['src'] = `${res.data.nginxServer}/${e.filePath}`
                o2['msrc'] = e.fileOrigin.previewUrl
              } else {
                o2['src'] = require('@/assets/file_ico/not_found.png')
                o2['msrc'] = require('@/assets/file_ico/not_found.png')
              }
              o2['alt'] = e.fileName
              o2['title'] = e.fileName
              if (e.imgWidth && e.imgHeight) {
                o2['w'] = e.fileMedia.imgWidth
                o2['h'] = e.fileMedia.imgHeight
              } else {
                o2['w'] = 1200
                o2['h'] = 900
              }
              imgList.push(o2)
            })
            o1['imgList'] = imgList
          }
          list.push(o1)
        })
        this.imgList = [ ...this.imgList, ...list ]
        this.loading = false
      }).catch((res) => {
        console.log('获取图片列表失败')
        this.loading = false
      })
    },
    onLoad () {
      // 异步更新数据
      setTimeout(() => {
        // 数据全部加载完成
        let flag = 0
        this.imgList.forEach(item1 => {
          item1.imgList.forEach(item2 => {
            flag++
          })
        })
        if (this.pagination.pageNum * this.pagination.pageSize > flag) {
          this.finished = true
          this.loading = false
          return
        }
        this.getImgList()
      }, 150)
    },
    previewImg (imgList, i, j) {
      let urls = []
      let startPosition = 0
      let flag = 0
      imgList.forEach((item1, index1) => {
        item1.imgList.forEach((item2, index2) => {
          urls.push(item2.msrc)
          if (i === index1 && j === index2) {
            startPosition = flag
          }
          flag++
        })
      })
      ImagePreview({
        images: urls,
        startPosition: startPosition,
        onClose () {
          // do something
        }
      });
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .gallery {
    margin-top: 60px;
  }
  .img-cell {
    text-align: center;
    .my-img {
      background-size:100% auto;
      width: 300px;
      height: 300px;
      margin: 10px 30px;
      margin: 10px 10px;
      box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.4);
      box-sizing: border-box;
    }
  }
</style>
