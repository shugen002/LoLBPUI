<template>
  <div
    class="player animate__animated"
    :class="{
      animate: animate
    }"
    ref="root"
  >
    <div class="item">
      <div v-if="player.active" class="choosing"></div>
      <div v-if="player.championId" class="hero" :style="hero"></div>
      <div v-if="!player.championId" class="locationplaceholder" :class="player.pos">
        <div class="placeholder"></div>
      </div>
      <div class="playername">
        <span>{{ player.name }}</span>
      </div>
      <div v-if="player.championId && !player.active" class="spellchoose">
        <div class="spell" :style="pspell1"></div>
        <div class="spell" :style="pspell2"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({
  props: {
    player: {
      type: Object,
      required: true
    }
  }
})
export default class App extends Vue {
  player!: {
    championId: string | null
    pos: string
    name: string
    spell1: {
      name: string | undefined
      icon: string | undefined
    }
    spell2: {
      name: string | undefined
      icon: string | undefined
    }
    active: boolean
  }
  animate = true
  mounted() {
    // @ts-ignore
    this.$refs.root.addEventListener('animationend', () => {
      this.animate = false
    })
    window.addEventListener('obsSourceActiveChanged', this.reanimate)
  }
  get hero() {
    return {
      'background-image': "url('/lol/champion/" + this.player.championId + "')"
    }
  }
  get pspell1() {
    if (this.player.spell1 && this.player.spell1.icon) {
      return {
        'background-image': "url('/lol/spell/" + this.player.spell1.icon + "')"
      }
    }
    return {}
  }
  get pspell2() {
    if (this.player.spell2 && this.player.spell2.icon) {
      return {
        'background-image': "url('/lol/spell/" + this.player.spell2.icon + "')"
      }
    }
    return {}
  }
  reanimate() {
    this.animate = true
  }
  beforeDestroy() {
    window.removeEventListener('obsSourceActiveChanged', this.reanimate)
  }
}
</script>

<style lang="stylus" scoped>
.player
  display flex

  .item
    margin auto
    width calc(100% - 10px)
    height calc(100% - 10px)
    background-color gray
    display flex
    position relative
    z-index 0

    .playername
      position absolute
      top 93px
      width 390px
      height 30px
      display flex

      span
        margin auto 0
        color white
        font-size 18px

    .locationplaceholder
      display flex
      position absolute
      width 400px
      height 123px

      .placeholder
        margin 15px auto auto auto
        width 64px
        height 64px
        background-position center
        background-size cover
        background-repeat no-repeat

      &.top
        .placeholder
          background-image url('../assets/placeholder/top_splash_placeholder.png')

      &.mid
        .placeholder
          background-image url('../assets/placeholder/mid_splash_placeholder.png')

      &.bot
        .placeholder
          background-image url('../assets/placeholder/bot_splash_placeholder.png')

      &.jung
        .placeholder
          background-image url('../assets/placeholder/jung_splash_placeholder.png')

      &.sup
        .placeholder
          background-image url('../assets/placeholder/sup_splash_placeholder.png')

    .hero
      position absolute
      height 123px
      width 400px
      background-position-y -25px
      background-position-x center
      background-size 130%

    .spellchoose
      position absolute
      width 70px
      height 123px
      display flex
      flex-direction column
      justify-content center
      align-items center

      .spell
        margin 5px
        width 48px
        height 48px

.TeamBlue
  background linear-gradient(to right, rgb(34, 158, 253), rgb(101, 221, 209))

  &.animate
    animation-name fadeInLeftBig

  .item
    .playername
      justify-content flex-end
      background linear-gradient(to right, #0000, rgba(34, 140, 196, 1))
      padding-right 10px

  .spellchoose
    left 0

  .choosing
    animation choosingBlue 2000ms linear infinite
    background linear-gradient(to left, #0000, rgba(34, 140, 196, 1))
    background-size 200% 200%

.TeamRed
  background linear-gradient(to left, rgb(255, 54, 145), rgb(249, 158, 243))

  &.animate
    animation-name fadeInRightBig

  .item
    .playername
      justify-content flex-start
      background linear-gradient(to left, #0000, rgba(208, 57, 117, 1))
      padding-left 10px

  .spellchoose
    right 0

  .choosing
    animation choosingRed 2000ms linear infinite
    background linear-gradient(to right, #0000, rgba(208, 57, 117, 1))
    background-size 200% 200%

.choosing
  z-index 1
  width 400px
  height 123px

@keyframes choosingBlue
  0%
    background-position 100% 100%

  50%
    background-position 0 100%

  100%
    background-position 100% 100%

@keyframes choosingRed
  0%
    background-position 0 100%

  50%
    background-position 100% 100%

  100%
    background-position 0 100%
</style>
