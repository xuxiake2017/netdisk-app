<template>
  <div class="message">
    <!-- closeable 模式，在右侧显示关闭按钮 -->
    <van-notice-bar
      v-if="!messages || messages.length === 0"
      :color="selectColor(1)"
      :background="selectBackground(1)">
      暂时未收到消息
    </van-notice-bar>
    <van-swipe-cell
      :right-width="50"
      :on-close="onClose"
      :id="item.id"
      :index="index"
      v-for="(item, index) in messages"
      v-bind:key="index">
      <van-notice-bar
        ref="noticeBar"
        :color="selectColor(item.type)"
        :background="selectBackground(item.type)"
        style="margin-top: 10px">
        {{item.description}}
      </van-notice-bar>
      <span slot="right" style="line-height: 100%">已读</span>
    </van-swipe-cell>
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
    haveRead (id, index, instance) {
      HaveRead({ id }).then(res => {
        instance.close();
        this.messages.splice(index, 1)
        if (this.messages.length === 0) {
          this.$store.commit('clearMessages')
        }
      })
    },
    onClose (clickPosition, instance) {
      const id = instance.$attrs.id
      const index = instance.$attrs.index
      switch (clickPosition) {
        case 'left':
        case 'cell':
        case 'outside':
          instance.close();
          break;
        case 'right':
          this.$dialog.confirm({
            message: '确定将该消息置为已读？'
          }).then(() => {
            this.haveRead(id, index, instance)
          });
          break;
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
    if (this.messages && this.messages.length > 0) {
      this.$toast('向左滑动将消息置为已读')
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .message {
    margin-top: 46px;
  }
</style>
<style>
  .message .van-swipe-cell__right {
    color: #fff;
    font-size: 15px;
    width: 50px;
    height: 44px;
    display: inline-block;
    text-align: center;
    line-height: 44px;
    background-color: #f44;
  }
</style>
