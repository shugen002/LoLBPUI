<template>
  <div id="app">
    <home></home>
  </div>
</template>

<script>
import Vue from 'vue'
import Home from './views/Home.vue'

export default Vue.extend({
  components: { Home }
})
</script>
<style scoped>
#app {
  height: 100vh;
  width: 100%;
  display: flex;
}
</style>
