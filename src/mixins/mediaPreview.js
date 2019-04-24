import { ImagePreview } from 'vant'

export default {
  data () {
    return {
      // 媒体预览
      mediaPopupShow: false,
      mediaFile: null
    }
  },
  components: {
    'media-preview': () => import('@/components/MediaPreview')
  },
  methods: {
    // 图片预览
    imagePreview (item) {
      ImagePreview([
        item.mediaCachePath
      ])
    },
    // 关闭媒体预览弹出层
    mediaPopupClose () {
      this.mediaPopupShow = false
      this.mediaFile = null
    },
    // 音乐、视频预览
    mediaPreview (item) {
      this.mediaPopupShow = true
      this.mediaFile = item
    }
  }
}
