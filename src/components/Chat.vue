<template>
  <div>
    <ul class="layui-layim-list layui-show">
      <li layim-event="chat" data-type="friend" data-index="0" class="layim-friend100001 "><img
        src="//tva1.sinaimg.cn/crop.0.0.118.118.180/5db11ff4gw1e77d3nqrv8j203b03cweg.jpg"><span>贤心</span>
        <p>这些都是测试数据，实际使用请严格按照该格式返回</p><span class="layim-msg-status">new</span></li>
      <li layim-event="chat" data-type="friend" data-index="0" class="layim-friend100001222 "><img
        src="//tva4.sinaimg.cn/crop.0.1.1125.1125.180/475bb144jw8f9nwebnuhkj20v90vbwh9.jpg"><span>刘小涛</span>
        <p>如约而至，不负姊妹欢乐颂</p><span class="layim-msg-status">new</span></li>
      <li layim-event="chat" data-type="friend" data-index="0" class="layim-friend10034001 "><img
        src="//tva2.sinaimg.cn/crop.1.0.747.747.180/633f068fjw8f9h040n951j20ku0kr74t.jpg"><span>谢小楠</span>
        <p></p><span class="layim-msg-status">new</span></li>
      <li layim-event="chat" data-type="friend" data-index="0" class="layim-friend168168 layim-list-gray"><img
        src="//tva1.sinaimg.cn/crop.0.0.180.180.180/7fde8b93jw1e8qgp5bmzyj2050050aa8.jpg"><span>马小云</span>
        <p>让天下没有难写的代码</p><span class="layim-msg-status">new</span></li>
      <li layim-event="chat" data-type="friend" data-index="0" class="layim-friend666666 "><img
        src="//tva1.sinaimg.cn/crop.0.0.512.512.180/6a4acad5jw8eqi6yaholjj20e80e8t9f.jpg"><span>徐小峥</span>
        <p>代码在囧途，也要写到底</p><span class="layim-msg-status">new</span></li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Chat'
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "../styles/layui/layui.css";
  @import "../styles/layui/layim.css";
</style>
