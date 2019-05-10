<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  created () {
    this.clientHeight = `${document.documentElement.clientHeight}`
    this.clientWidth = `${document.documentElement.clientWidth}`
    // 暂时不用动态改变
    // window.addEventListener('resize', () => {
    //   this.clientHeight = `${document.documentElement.clientHeight}`
    //   this.clientWidth = `${document.documentElement.clientWidth}`
    // })
  },
  computed: {
    clientHeight: {
      get () {
        return this.$store.getters.clientHeight
      },
      set (val) {
        this.$store.commit('setClientHeight', val)
      }
    },
    clientWidth: {
      get () {
        return this.$store.getters.clientWidth
      },
      set (val) {
        this.$store.commit('setClientWidth', val)
      }
    }
  }
}
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    /*background-color: #f2f3f5;*/
  }
  .van-button--info {
    color: #fff;
    background-color: #1989fa;
    border: 1px solid #1989fa;
  }
  /*.home-nav-bar .van-nav-bar__left {*/
    /*left: 15px;*/
    /*top: 8px;*/
  /*}*/
</style>
