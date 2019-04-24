<template>
  <div>
    <van-cell-group class="user-info">
      <van-cell title="头像" class="van-cell-avatar-uploader" required>
        <el-upload
          class="avatar-uploader"
          :action="uploadAction"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
          :with-credentials="true">
          <img v-if="form.avatar" :src="form.avatar" class="avatar">
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </van-cell>
      <van-cell title="用户状态" class="van-cell-user-status">
        <van-tag plain :type="labelType(form.userStatus)">{{statusLabels(form.userStatus)}}</van-tag>
      </van-cell>
      <van-field
        v-model="form.username"
        required
        clearable
        label="用户名"
        placeholder="请输入用户名"
        right-icon="question-o"
        @click-right-icon="$toast('若更改用户名，必须重新键入密码')"
      />

      <van-field
        v-model="form.password"
        type="password"
        label="密码"
        placeholder="请输入密码"
        required
      />
      <van-field
        v-model="form.email"
        label="邮箱"
        placeholder="请输入邮箱"
        required
      />
      <van-field
        v-model="form.phone"
        label="电话"
        placeholder="请输入电话"
        required
      />
      <van-field
        v-model="form.realName"
        label="真实姓名"
        placeholder="请输入姓名"
        required
      />
      <van-field
        v-model="form.totalMemory"
        label="总容量"
        disabled
      />
      <van-field
        v-model="availableMemory"
        label="可用容量"
        disabled
      />
      <van-cell title="性别" class="van-cell-sex" required>
        <van-radio-group v-model="form.sex">
          <van-radio name="1">男</van-radio>
          <van-radio name="2">女</van-radio>
        </van-radio-group>
      </van-cell>
      <van-cell title="" class="van-cell-save-button">
        <van-button size="small" type="info" @click="onSubmit">保存</van-button>
      </van-cell>
    </van-cell-group>
  </div>
</template>

<script>
import { Detail, Update } from '@/api/user'
import util from '@/utils/util'
export default {
  name: 'UserInfo',
  data () {
    return {
      uploadAction: `${process.env.BASE_API}/user/uploadAvatar`,
      oldUsername: '',
      form: {
        id: null,
        username: '',
        password: '',
        sex: '',
        realName: '',
        totalMemory: '',
        usedMemory: '',
        phone: '',
        email: '',
        avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
        userStatus: ''
      },
      availableMemory: null
    }
  },
  methods: {
    userDetail () {
      Detail().then(res => {
        this.form = res.data
        this.oldUsername = this.form.username
        this.availableMemory = parseInt(this.form.totalMemory) - parseInt(this.form.usedMemory)
        this.availableMemory = util.formatFileSize(this.availableMemory)
        this.form.totalMemory = util.formatFileSize(this.form.totalMemory)
      })
    },
    labelType (userStatus) {
      switch (parseInt(userStatus)) {
        case this.$NetdiskConstant.USER_STATUS_NORMAL:
          return 'primary'
        case this.$NetdiskConstant.USER_STATUS_VIP:
          return 'success'
        case this.$NetdiskConstant.USER_STATUS_NOT_VERIFY:
          return 'danger'
        default:
          break
      }
    },
    statusLabels (userStatus) {
      switch (parseInt(userStatus)) {
        case this.$NetdiskConstant.USER_STATUS_NORMAL:
          return '普通用户'
        case this.$NetdiskConstant.USER_STATUS_VIP:
          return 'VIP用户'
        case this.$NetdiskConstant.USER_STATUS_NOT_VERIFY:
          return '未激活'
        default:
          break
      }
    },
    handleAvatarSuccess (res, file) {
      this.form.avatar = res.data
    },
    beforeAvatarUpload (file) {
      const isJPG = file.type === 'image/jpeg';
      const isPNG = file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!(isJPG || isPNG)) {
        this.$toast('上传头像图片只能是 JPG/PNG 格式!')
      }
      if (!isLt2M) {
        this.$toast('上传头像图片大小不能超过 2MB!')
      }
      return (isJPG || isPNG) && isLt2M;
    },
    onSubmit () {
      if (this.oldUsername !== this.form.username && !this.form.password) {
        this.$toast('若更改用户名，必须重新键入密码')
        return
      }
      Update(this.form).then(res => {
        this.$dialog.confirm({
          title: '提示',
          message: '修改成功, 是否返回首页?'
        }).then(() => {
          this.$router.push({ path: '/fileList' })
        }).catch(() => {
          // on cancel
        })
      }).catch(() => {
        console.log('用户详情保存失败')
      })
    }
  },
  mounted () {
    this.userDetail()
  }
}
</script>

<style scoped>
 .user-info {
   margin-top: 46px;
 }
 .avatar-uploader {
   border: 1px dashed #d9d9d9;
   border-radius: 6px;
   cursor: pointer;
   position: relative;
   overflow: hidden;
   width: 100px;
   height: 100px;
 }
 .avatar-uploader:hover {
   border-color: #409EFF;
 }
 .avatar-uploader-icon {
   font-size: 28px;
   color: #8c939d;
   width: 100px;
   height: 100px;
   line-height: 100px;
   text-align: center;
 }
 .avatar {
   width: 100px;
   height: 100px;
   display: block;
 }
</style>
<style>
  .van-cell-avatar-uploader .van-cell__title {
    max-width: 90px;
  }
  .van-cell-sex .van-cell__title {
    max-width: 90px;
  }
  .van-cell-sex .van-cell__value {
    text-align: left;
  }
  .van-cell-user-status .van-cell__title {
    max-width: 90px;
  }
  .van-cell-user-status .van-cell__value {
    text-align: left;
  }
  .van-cell-save-button .van-cell__title {
    max-width: 90px;
  }
</style>
