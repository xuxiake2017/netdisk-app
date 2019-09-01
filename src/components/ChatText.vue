<template>
  <div @click="clickHandler" class="chat-text">
    <div v-html="msgContent"></div>
    <el-image
      v-if="isImage"
      :src="msg"
      :lazy="false"
      :class="{'img-load-error': error}"
      fit="cover"
      @error="onErrorHandler">
    </el-image>
  </div>
</template>

<script>
import { emojiConvert } from '../utils/emoji'
import util from '../utils/util'
import { FindById } from '../api/file'
import { ImagePreview } from 'vant'

export default {
  name: 'ChatText',
  data () {
    return {
      msgContent: '',
      file: null,
      isImage: false,
      error: false
    }
  },
  props: {
    msg: {
      type: String
    },
    fileId: {
      type: Number
    }
  },
  methods: {
    convert () {
      if (this.msg) {
        const reg = /^http:\/\/.*?(gif|png|jpg|jpeg)$/i
        if (reg.test(this.msg)) {
          this.isImage = true
          return
        }
        const newData = this.msg.replace(/(:)\w+(:)/g, function (s, match) {
          return emojiConvert(s)
        })
        this.msgContent = newData
      } else if (this.fileId) {
        FindById({
          id: this.fileId
        }).then(res => {
          this.file = res.data
          let temp = ''
          if (this.file) {
            temp =
              `
            <div class="file-box">
              <div class="file-box-img">
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="${this.fileIcoFilter(this.file.fileType)}"></use>
                </svg>
              </div>
              <div class="file-box-text">
                <div class="file-box-name">
                  ${this.file.fileRealName}
                </div>
                <div class="file-box-size">
                  ${this.formatFileSize(this.file)}
                </div>
              </div>
            </div>
            `
          } else {
            temp =
              `
            <div class="file-box">
              <div class="file-box-img">
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="${this.fileIcoFilter(this.$NetdiskConstant.FILE_TYPE_OF_OTHER)}"></use>
                </svg>
              </div>
              <div class="file-box-text">
                <div class="file-box-name" style="color: #b2b9c3;">
                  该文件已不存在
                </div>
              </div>
            </div>
            `
          }
          this.msgContent = temp
        })
      }
    },
    fileIcoFilter (fileType) {
      switch (fileType) {
        case this.$NetdiskConstant.FILE_TYPE_OF_TXT :
          return '#icon-file_txt'
        case this.$NetdiskConstant.FILE_TYPE_OF_WORD :
          return '#icon-file_word_office'
        case this.$NetdiskConstant.FILE_TYPE_OF_EXCEL :
          return '#icon-file_excel_office'
        case this.$NetdiskConstant.FILE_TYPE_OF_POWERPOINT :
          return '#icon-file_ppt_office'
        case this.$NetdiskConstant.FILE_TYPE_OF_PDF :
          return '#icon-file_pdf'
        case this.$NetdiskConstant.FILE_TYPE_OF_PIC :
          return '#icon-file_pic'
        case this.$NetdiskConstant.FILE_TYPE_OF_MUSIC :
          return '#icon-file_music'
        case this.$NetdiskConstant.FILE_TYPE_OF_VIDEO :
          return '#icon-file_video'
        case this.$NetdiskConstant.FILE_TYPE_OF_ZIP :
          return '#icon-file_zip'
        case this.$NetdiskConstant.FILE_TYPE_OF_APK :
          return '#icon-file_unknown'
        case this.$NetdiskConstant.FILE_TYPE_OF_OTHER :
          return '#icon-file_unknown'
      }
    },
    formatFileSize (row) {
      return util.formatFileSize(row.fileSize)
    },
    clickHandler () {
      if (this.isImage && !this.error) {
        ImagePreview([
          this.msg
        ])
        return
      }
      if (!this.file) {
        return
      }
      this.$emit('file-click', this.file)
    },
    onErrorHandler () {
      this.error = true
    }
  },
  mounted () {
    this.convert()
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .chat-text {
    .el-image {
      width: 100px;
    }
    .img-load-error {
      width: 100px;
      height: 60px;
    }
  }
</style>

<style rel="stylesheet/scss" lang="scss">
  .file-box {
    border: black;
    .file-box-img {
      display: inline-block;
      width: 50px;
      height: 50px;
      font-size: 50px;
      line-height: 50px;
      vertical-align: top;
    }
    .file-box-text {
      display: inline-block;
    }
    .file-box-name {
      max-height: 50px;
      vertical-align: top;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2; /*第二行显示 ...*/
      -webkit-box-orient: vertical;
      max-width: 180px;
    }
    .file-box-size {
      color: #b2b9c3;
    }
  }
</style>
