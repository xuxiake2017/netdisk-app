import { ImagePreview } from 'vant'
import { GetFileMediaInfo } from '@/api/file'
import { GetShareFileMediaInfo } from '@/api/share'

export default {
  data () {
    return {
      // 媒体预览
      mediaPopupShow: false,
      mediaFile: null,
      // 标记：1 文件列表预览 2 分享预览 3 聊天文件预览
      previewFlag: 1
    }
  },
  components: {
    'media-preview': () => import('@/components/MediaPreview')
  },
  methods: {
    // 图片预览
    imagePreview (params) {
      this.getFileDetail(params).then(file => {
        ImagePreview([
          file.fileOrigin.previewUrl
        ])
      })
    },
    // 关闭媒体预览弹出层
    mediaPopupClose () {
      this.mediaPopupShow = false
      this.mediaFile = null
    },
    // 音乐、视频预览
    mediaPreview (params) {
      this.getFileDetail(params).then(file => {
        this.mediaPopupShow = true
        this.mediaFile = file
      })
    },
    getFileDetail (params) {
      return new Promise((resolve, reject) => {
        switch (this.previewFlag) {
          case 1:
          case 3:
            GetFileMediaInfo(params).then(res => {
              resolve(res.data)
            }).catch((res) => {
              reject(res)
            })
            break
          case 2:
            GetShareFileMediaInfo(params).then(res => {
              resolve(res.data)
            }).catch(res => {
              reject(res)
            })
            break
        }
      })
    }
  }
}
