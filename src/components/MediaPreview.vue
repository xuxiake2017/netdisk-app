<template>
  <van-popup
    v-model="show"
    class="media-popup"
    position="right">
    <van-nav-bar
      :title="title"
      left-text="返回"
      left-arrow
      @click-left="mediaPopupClose">
    </van-nav-bar>
    <div v-if="mediaFile && mediaFile.fileType === $NetdiskConstant.FILE_TYPE_OF_MUSIC">
      <aplayer :music="musicOptions"/>
    </div>
    <div v-if="mediaFile && mediaFile.fileType === $NetdiskConstant.FILE_TYPE_OF_VIDEO">
      <video-player class="vjs-custom-skin"
                    ref="videoPlayer"
                    :options="playerOptions"
                    :playsinline="true"
                    style="width: 100%">
      </video-player>
    </div>
  </van-popup>
</template>

<script>
import 'video.js/dist/video-js.css'
import 'vue-video-player/src/custom-theme.css'
import { videoPlayer } from 'vue-video-player'
import Aplayer from 'vue-aplayer'
export default {
  name: 'MediaPreview',
  components: {
    videoPlayer,
    Aplayer
  },
  data () {
    return {
      // videojs options
      playerOptions: {
        fluid: true,
        preload: 'auto',
        autoplay: false,
        muted: true,
        language: 'en',
        playbackRates: [0.7, 1.0, 1.5, 2.0],
        sources: [{
          type: 'video/mp4',
          // mp4
          src: ''
          // webm
          // src: "https://cdn.theguardian.tv/webM/2015/07/20/150716YesMen_synd_768k_vp8.webm"
        }],
        poster: ''
      },
      musicOptions: {
        title: '',
        artist: '没有演唱者信息',
        src: '',
        pic: ''
      },
      title: ''
    }
  },
  methods: {
    mediaPopupClose () {
      this.$emit('media-popup-close')
    }
  },
  props: {
    show: {
      type: Boolean,
      default: false,
      required: true
    },
    mediaFile: {
      type: Object
    }
  },
  mounted () {
  },
  watch: {
    mediaFile () {
      if (!this.mediaFile) {
        this.playerOptions.sources.splice(0)
        this.musicOptions.title = ''
        this.musicOptions.src = ''
      } else {
        if (!this.mediaFile.mediaCachePath) {
          this.$toast('正在转码中，请稍后再试')
        }
        this.title = this.mediaFile.fileRealName
        if (this.mediaFile.fileType === this.$NetdiskConstant.FILE_TYPE_OF_VIDEO) {
          this.playerOptions.sources.splice(0)
          this.playerOptions.sources.push({
            type: 'video/mp4',
            src: this.mediaFile.mediaCachePath})
        } else if (this.mediaFile.fileType === this.$NetdiskConstant.FILE_TYPE_OF_MUSIC) {
          this.musicOptions.title = this.mediaFile.fileRealName
          this.musicOptions.src = this.mediaFile.mediaCachePath
        }
      }
    }
  }
}
</script>

<style scoped>
  .media-popup {
    height: 100%;
    width: 100%;
  }
</style>
