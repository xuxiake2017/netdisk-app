<template>
  <div class="mqtt">
    <van-row class="switch">
      蓝灯：
      OFF
      <van-switch v-model="checkedBlue" active-color="#1989fa" @change="blueLightOption"/>
      ON
    </van-row>
    <van-row class="switch">
      绿灯：
      OFF
      <van-switch v-model="checkedGreen" active-color="#07c160" @change="greenLightOption"/>
      ON
    </van-row>
  </div>
</template>

<script>
import { LightOption } from '@/api/mqtt'
export default {
  name: 'Mqtt',
  data () {
    return {
      checkedBlue: false,
      checkedGreen: false
    }
  },
  methods: {
    blueLightOption (val) {
      let params = {
        type: 'BLUE',
        status: val ? 'ON' : 'OFF'
      }
      LightOption(params).then(res => {
        this.$toast('操作成功')
      })
    },
    greenLightOption (val) {
      let params = {
        type: 'GREEN',
        status: val ? 'ON' : 'OFF'
      }
      LightOption(params).then(res => {
        this.$toast('操作成功')
      })
    }
  }
}
</script>

<style scoped>
  .mqtt {
    margin-top: 60px;
  }
  .switch {
    display: flex;
    align-items: center;
    height: 50px;
    text-align: center;
    margin-left: 50px;
  }
</style>
