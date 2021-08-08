<template>
  <div
    class="ban animate__animated"
    :class="{
      animate: animate
    }"
    ref="root"
  >
    <div class="shape">
      <div
        v-if="ban.active || ban.champion"
        class="hero"
        :class="{ locked: locked, active: ban.active }"
        :style="{
          'background-image': ban.champion ? 'url(\'/lol/champion/' + this.ban.champion + '\')' : 'none'
        }"
      ></div>
    </div>
    <div v-if="locked" class="lock">
      <img src="../assets/placeholder/ban_placeholder.svg" alt="" />
    </div>
  </div>
</template>
<style lang="stylus" scoped>
.ban
  height 132px
  position relative

  &.animate
    animation-name fadeInUpBig

  .shape
    border solid 5px rgb(207, 207, 207)
    background-color gray
    height 100%
    width 112px

    .hero
      height 100%
      width 100%
      border solid 5px #0000
      background-position-x center
      background-position-y 10px
      background-size 300%

      &.locked
        filter grayscale(1)

  .lock
    width 156px
    height 142px
    position absolute
    top 0
    left 0
    display flex
    justify-content center
    align-items center

    img
      width 108px
      height 108px

.TeamBlue
  .shape
    margin-left -17px
    margin-right 17px
    transform skew(15deg)
    overflow hidden

    .hero
      margin-left -17px
      transform skew(-15deg) scale(1.4)

      &.locked
        animation bluelockhero 0.5s 1 linear

      &.active
        animation choosingBlue 2s infinite

  .lock
    margin-left -36px

.TeamRed
  .shape
    margin-left 18px
    margin-right -18px
    transform skew(-15deg)
    overflow hidden

    .hero
      margin-left -13px
      transform skew(15deg) scale(1.4)

      &.locked
        animation redlockhero 0.5s 1 linear

      &.active
        animation choosingRed 2s infinite

  .lock
    margin-right -36px

@keyframes bluelockhero
  0%
    filter grayscale(0)
    transform skew(-15deg) scale(2)

  50%
    filter grayscale(0.5)
    transform skew(-15deg) scale(1.7)

  100%
    filter grayscale(1)
    transform skew(-15deg) scale(1.4)

@keyframes redlockhero
  0%
    filter grayscale(0)
    transform skew(15deg) scale(2)

  50%
    filter grayscale(0.5)
    transform skew(15deg) scale(1.7)

  100%
    filter grayscale(1)
    transform skew(15deg) scale(1.4)

@keyframes choosingBlue
  0%
    background-color rgba(34, 140, 196, 0.5)

  50%
    background-color rgba(34, 140, 196, 1)

  100%
    background-color rgba(34, 140, 196, 0.5)

@keyframes choosingRed
  0%
    background-color rgba(208, 57, 117, 0.5)

  50%
    background-color rgba(208, 57, 117, 1)

  100%
    background-color rgba(208, 57, 117, 0.5)
</style>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class App extends Vue {
  @Prop() private ban!: {
    champion: string
    active: boolean
  }
  animate = true
  get locked() {
    return this.ban.champion && !this.ban.active
  }
  mounted() {
    // @ts-ignore
    this.$refs.root.addEventListener('animationend', () => {
      this.animate = false
    })
    window.addEventListener('obsSourceActiveChanged', this.reanimate)
  }
  reanimate() {
    this.animate = true
  }
  beforeDestroy() {
    window.removeEventListener('obsSourceActiveChanged', this.reanimate)
  }
}
</script>
