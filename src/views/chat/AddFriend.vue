<template>
  <div class="add-friend">
    <van-nav-bar
      :title="'添加好友'"
      left-text="返回"
      left-arrow
      @click-left="goBack">
    </van-nav-bar>
    <el-input placeholder="用户名/手机/邮箱" class="input-with-select" size="medium" v-model="searchKey">
      <i slot="suffix" class="el-input__icon el-icon-search" style="color: #1989fa;" @click="searchFriend"></i>
    </el-input>
    <div>
      <ul class="layui-layim-list layui-show">
        <li v-for="(item, index) in searchResult" :key="index" @click="openAddFriendConfirmDialog(item)">
          <img :src="item.avatar"/>
          <span>{{item.username}}</span>
          <p>{{item.signature}}</p>
        </li>
      </ul>
      <div class="layui-flow-more" v-if="searchAction && searchResult.length === 0">
        <li class="layim-msgbox-tips">暂无更多</li>
      </div>
    </div>
    <van-dialog
      v-model="addFriendConfirmDialogShow"
      title="添加好友"
      show-cancel-button
      class="add-friend-confirm-dialog"
      :before-close="beforeCloseHandler"
    >
      <div id="" class="layui-layer-content">
        <div class="layim-add-box">
          <div class="layim-add-img">
            <img class="layui-circle" :src="addApplyForData.avatar">
            <p>{{addApplyForData.username}}</p>
          </div>
          <div class="layim-add-remark">
            <van-field
              v-model="addApplyForData.postscript"
              label="验证信息"
            />
          </div>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script>
import { SearchFriend, AddFriendRequest } from '@/api/friendApplyFor'
import { mapGetters } from 'vuex'
export default {
  name: 'AddFriend',
  data () {
    return {
      // 好友搜索的关键字
      searchKey: '',
      // 搜索动作
      searchAction: false,
      // 搜索结果
      searchResult: [],
      // 添加好友确认对话框标记
      addFriendConfirmDialogShow: false,
      // 添加好友请求数据
      addApplyForData: {
        respondent: '',
        username: '',
        avatar: '',
        postscript: ''
      }
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ])
  },
  methods: {
    goBack () {
      this.$router.go(-1)
    },
    // 添加好友弹出层关闭
    addFriendPopupClose () {
      this.addFriendPopupShow = false
      this.searchKey = ''
      this.searchAction = false
      this.searchResult = []
    },
    // 搜索好友
    searchFriend () {
      if (!this.searchKey) {
        return
      }
      SearchFriend({ key: this.searchKey }).then(res => {
        this.searchAction = true
        this.searchResult = res.data
      })
    },
    // 打开添加好友确认对话框
    openAddFriendConfirmDialog (item) {
      this.addApplyForData.respondent = item.userId
      this.addApplyForData.username = item.username
      this.addApplyForData.avatar = item.avatar
      this.addApplyForData.postscript = `我是${this.user.name}，申请添加好友`
      this.addFriendConfirmDialogShow = true
    },
    // 发送添加好友请求
    sendAddFriendRequest (done) {
      AddFriendRequest({ ...this.addApplyForData }).then(res => {
        this.$toast('添加好友请求发送成功! ')
        done()
      }).catch(res => {
        done(false)
      })
    },
    // 添加好友确认对话框关闭
    beforeCloseHandler (action, done) {
      if (action === 'confirm') {
        this.sendAddFriendRequest(done)
      } else {
        done()
      }
    }
  }
}
</script>

<style scoped>
  .add-friend {
    text-align: left;
  }
  .add-friend-confirm-dialog .layim-add-remark {
    width: 100%;
    display: block;
    margin: 10px auto 0;
  }
  .add-friend-confirm-dialog .layim-add-img {
    margin: 0 auto;
    display: block;
  }
</style>
