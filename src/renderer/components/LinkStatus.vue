<template>
  <Card>
    <p slot="title">链接状态</p>
    <p>
      <span v-if="state === 0">连接中</span>
      <span v-if="state === 1">已连接</span>
      <span v-if="state === 2">关闭中</span>
      <span v-if="state === 3">已关闭</span>
    </p>
  </Card>
</template>

<script>
import debounce from 'lodash.debounce'
export default {
  data() {
    return {
      state: 3,
      stateDebounce: null
    }
  },
  mounted() {
    this.stateDebounce = debounce(this._stateChange.bind(this), 1000)
    window.API.LCUService.addEventListener('connecting', this._stateChange)
    window.API.LCUService.addEventListener('open', this._stateChange)
    window.API.LCUService.addEventListener('close', this._stateChange)
    window.API.LCUService.addEventListener('error', this._stateChange)
    this.getState()
  },
  methods: {
    _stateChange() {
      this.getState()
    },
    getState() {
      window.API.LCUService.getState().then((e) => {
        this.state = e.data
      })
    }
  },
  beforeDestroy() {
    window.API.LCUService.removeEventListener('connecting', this._stateChange)
    window.API.LCUService.removeEventListener('open', this._stateChange)
    window.API.LCUService.removeEventListener('close', this._stateChange)
    window.API.LCUService.removeEventListener('error', this._stateChange)
  }
}
</script>
