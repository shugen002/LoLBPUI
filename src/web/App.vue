<template>
  <div id="app">
    <Bar style="grid-area bar"></Bar>
    <Chooseholder></Chooseholder>
    <Banholder></Banholder>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Time from './components/Time.vue'
import Bar from './components/Bar.vue'
import Player from './components/Player.vue'
import Banholder from './components/Banholder.vue'
import Chooseholder from './components/Chooseholder.vue'

@Component({
  components: {
    Time,
    Bar,
    Player,
    Banholder,
    Chooseholder
  }
})
export default class App extends Vue {}
</script>

<style lang="stylus">
html, body
  margin 0
  border 0
  padding 0
  overflow hidden

:root
  --time-width 157px
  --team-width 687px
  --team-name-size 50px
  --team-time-color #eaeaea
  --ban-size 50px
  --ban-l-size 80px
</style>
<style scoped lang="stylus">
#app
  width 100%
  height 100vh
  display grid
  grid-template-rows 145px 35px 695px 35px 142px 1fr
  grid-template-columns 1fr
  grid-template-areas 'bar' '.' 'choose' '.' 'ban' '.'
</style>
<style lang="stylus">
*
  font-family 'Source Han Sans CN'
  font-weight 700

/**
 字体文件，不作分发
.SlideTownsoul
  font-family 'SlideTownsoul'
  font-weight 500

.warfont
  font-family 'war'
  font-weight 500

// 演示镇魂行楷
@font-face
  font-family SlideTownsoul
  src url('./assets/SlideTownsoul-Regular.ttf')

// 字体传奇特战体(正式版).ttf
@font-face
  font-family 'war'
  src url('./assets/war.ttf')

 */
</style>
