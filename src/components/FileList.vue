<template>
  <div class="float-left">
    <van-list
      v-model="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <van-collapse
        v-model="activeNames"
        ref="vanCollapse">
        <van-collapse-item
          name="1"
          value="2019-03-08 18:50"
          ref="vanCollapseItem"
          @click.native="fn"
          :disabled="disabled"
        >
          <div slot="title">
            <van-row>
              <van-col>
                <img src="../assets/file_ico/Folder_24_e0cacad.png"/>
              </van-col>
              <van-col offset="1">
                文档2019
              </van-col>
            </van-row>
          </div>
          <van-button size="mini" type="danger" @click="deleteHandler">删除</van-button>
          <van-button size="mini" type="primary" @click="downloadHandler">下载</van-button>
        </van-collapse-item>
        <van-collapse-item
          name="2"
          value="2019-03-08 18:50"
        >
          <div slot="title">
            <van-row>
              <van-col>
                <img src="../assets/file_ico/Folder_24_e0cacad.png"/>
              </van-col>
              <van-col offset="1">
                文档2019
              </van-col>
            </van-row>
          </div>
          <van-button size="mini" type="danger" @click="deleteHandler">删除</van-button>
          <van-button size="mini" type="primary" @click="downloadHandler">下载</van-button>
        </van-collapse-item>
        <van-collapse-item
          name="3"
          value="2019-03-08 18:50"
        >
          <div slot="title">
            <van-row>
              <van-col>
                <img src="../assets/file_ico/Folder_24_e0cacad.png"/>
              </van-col>
              <van-col offset="1">
                文档2019
              </van-col>
            </van-row>
          </div>
          <van-button size="mini" type="danger" @click="deleteHandler">删除</van-button>
          <van-button size="mini" type="primary" @click="downloadHandler">下载</van-button>
        </van-collapse-item>
      </van-collapse>

      <!--<van-cell value="内容" icon="shop-o" is-link>
        <template slot="title">
          <span class="custom-text">单元格</span>
          <van-tag type="danger">标签</van-tag>
        </template>
      </van-cell>
      <van-cell
        v-for="item in list"
        :key="item"
        :title="item"
      />-->
    </van-list>
  </div>
</template>

<script>
import $ from 'jquery'
export default {
  name: 'FileList',
  data () {
    return {
      list: [],
      loading: false,
      finished: false,
      activeNames: [],
      disabled: false
    }
  },
  methods: {
    onLoad () {
      // 异步更新数据
      setTimeout(() => {
        for (let i = 0; i < 10; i++) {
          this.list.push(this.list.length + 1)
        }
        // 加载状态结束
        this.loading = false

        // 数据全部加载完成
        if (this.list.length >= 40) {
          this.finished = true
        }
      }, 500)
    },
    fn (event) {
      // this.disabled = false
      console.log(event.path[0])
      const className = $(event.path[0]).prop('className')
      if (className.indexOf('van-cell__right-icon') !== -1) {
        this.$refs.vanCollapseItem.parent.switch(this.$refs.vanCollapseItem.name, this.$refs.vanCollapseItem.expanded)
      } else if (className.indexOf('van-button') !== -1) {
      } else {
        this.$refs.vanCollapseItem.parent.switch(this.$refs.vanCollapseItem.name, !this.$refs.vanCollapseItem.expanded)
      }
    },
    deleteHandler () {
    },
    downloadHandler () {
    }
  }
}
</script>

<style scoped>
  .float-left {
    text-align: left;
  }
</style>
