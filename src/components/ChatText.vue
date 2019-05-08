<template>
  <div ref="msgContent"></div>
</template>

<script>
import { emojiConvert } from '../utils/emoji'
export default {
  name: 'ChatText',
  data () {
    return {
      msgContent: ''
    }
  },
  props: {
    msg: {
      type: String
    }
  },
  methods: {
    convert () {
      const newData = this.msg.replace(/(:)\w+(:)/g, function (s, match) {
        return emojiConvert(s)
      })
      this.msgContent = newData
      this.$refs.msgContent.innerHTML = newData
    }
  },
  mounted () {
    this.convert()
  }
}
</script>

<style scoped>

</style>
