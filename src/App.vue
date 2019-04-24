<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
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
  .home-nav-bar .van-nav-bar__left {
    left: 15px;
    top: 8px;
  }
</style>
