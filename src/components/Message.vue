<template>
  <div class="message">
    <!-- closeable 模式，在右侧显示关闭按钮 -->
    <van-notice-bar
      v-if="!messages || messages.length === 0"
      :color="selectColor(1)"
      :background="selectBackground(1)">
      暂时未收到消息
    </van-notice-bar>
    <van-notice-bar
      ref="noticeBar"
      mode="closeable"
      v-for="(item, index) in messages"
      v-bind:key="index"
      :color="selectColor(item.type)"
      :background="selectBackground(item.type)"
      @click.native="haveRead($event, item, index)"
      style="margin-top: 10px">
      {{item.description}}
    </van-notice-bar>
  </div>
</template>

<script>
import { HaveRead } from '@/api/message'
export default {
  name: 'Message',
  data () {
    return {
      messages: [],
      types: [
        'success',
        'info',
        'warning',
        'error'
      ]
    }
  },
  methods: {
    haveRead (e, item, index) {
      const className = event.srcElement.className
      if (className.indexOf('van-notice-bar__right-icon') !== -1) {
        HaveRead({ id: item.id }).then(res => {
          this.messages.splice(index, 1)
          if (this.messages.length === 0) {
            this.$store.commit('clearMessages')
          }
        })
      }
    },
    selectColor (type) {
      switch (type) {
        case 0:
          return '#67c23a'
        case 1:
          return '#909399'
        case 2:
          return '#e6a23c'
        case 3:
          return '#f56c6c'
      }
    },
    selectBackground (type) {
      switch (type) {
        case 0:
          return '#f0f9eb'
        case 1:
          return '#f4f4f5'
        case 2:
          return '#fdf6ec'
        case 3:
          return '#fef0f0'
      }
    }
  },
  mounted () {
    const user = this.$store.getters.user
    this.messages = user.messages
  }
}
</script>

<style scoped>
  .message {
    margin-top: 60px;
  }
</style>
