<template>
  <div
    class="bar animate__animated"
    :class="{
      animate: animate
    }"
    ref="root"
  >
    <div class="BlueTeam">
      <div class="shape"></div>
      <div style="margin: auto">
        <img v-if="blue.icon" :src="blue.icon" class="team-icon" alt="" />
      </div>
      <span class="SlideTownsoul" style="margin: auto">{{ blue.name }}</span>
      <div class="empty"></div>
    </div>
    <div class="BlueTime">
      <div class="shape" :class="{ active: status.blueTiming }">
        <Time v-if="status.blueTiming" :time="blueRestTime"></Time>
      </div>
    </div>
    <div class="middle">
      <div class="score-text">
        <span>{{ blue.score }} - {{ red.score }}</span>
      </div>
      <div class="phase-text">
        <span class="warfont">{{ status.phase }}</span>
      </div>
    </div>
    <div class="RedTime">
      <div class="shape" :class="{ active: status.redTiming }">
        <Time v-if="status.redTiming" :time="redRestTime"></Time>
      </div>
    </div>
    <div class="RedTeam">
      <div class="empty"></div>
      <span class="SlideTownsoul" style="margin: auto">{{ red.name }}</span>
      <div style="margin: auto">
        <img v-if="red.icon" :src="red.icon" class="team-icon" alt="" />
      </div>
      <div class="shape"></div>
    </div>
  </div>
</template>

<style lang="stylus" scoped>
.bar
  display flex
  justify-content center
  text-align center
  height 100%
  overflow hidden

  &.animate
    animation-name fadeInDownBig

  .middle
    width 270px
    height 145px
    background-color rgb(34, 24, 21)
    clip-path polygon(0 0, 100% 0, 86% 100%, 14% 100%)
    display grid
    grid-template-rows 107px 37px 1fr

    .score-text
      margin auto
      width 100%
      font-size 60px
      height 100%
      text-align center
      color white
      display flex

      span
        color #ffffff
        margin auto

    .phase-text
      display flex
      background-color rgb(62, 58, 57)

      span
        font-size 18px
        color #d0d0d0
        margin auto

  .shape
    background-color #333

  .RedTime
    width var(--time-width)
    font-size 50px
    height 100%

    .shape
      margin-left -20px
      height calc(100% - 10px)
      transform skew(-15deg)
      border solid 5px rgb(249, 158, 243)
      display flex

      span
        color var(--team-time-color)
        margin auto
        width 100%

      &.active
        background-color rgb(208, 57, 117)

  .BlueTime
    width var(--time-width)
    font-size 50px
    height 100%

    .shape
      margin-right -20px
      height calc(100% - 10px)
      transform skew(15deg)
      border solid 5px rgb(118, 230, 223)
      display flex

      span
        color var(--team-time-color)
        margin auto
        width 100%

      &.active
        background-color rgb(34, 140, 196)

  .BlueTeam
    width var(--team-width)
    margin-right -19px
    background-color gray
    display grid
    grid-template-columns 27px 148px 1fr 40px

    .shape
      background-color rgb(34, 140, 196)

    span
      margin auto
      color #76e6df
      text-shadow 6px 6px 2px #228cc4
      font-size var(--team-name-size)

  .RedTeam
    width var(--team-width)
    margin-left -19px
    background-color gray
    display grid
    grid-template-columns 40px 1fr 148px 27px

    .shape
      background-color rgb(208, 57, 117)

    span
      margin auto
      color #f99ef3
      text-shadow 6px 6px 2px #d03975
      font-size var(--team-name-size)

.team-icon
  max-width 128px
  max-height 128px
</style>

<script lang="ts">
import { RemoteConnection } from '../RemoteConnection'
import { Component, Vue } from 'vue-property-decorator'
import Time from './Time.vue'

@Component({
  components: {
    Time
  }
})
export default class App extends Vue {
  private blueRestTime = 0
  private redRestTime = 0
  private status = {
    blueTeamTime: 0,
    redTeamTime: 0,
    blueTiming: false,
    redTiming: false,
    phase: ''
  }
  private lastUpdateTime = 0
  private blue = {
    icon: null,
    name: '',
    score: 0
  }
  private red = {
    icon: null,
    name: '',
    score: 0
  }
  RemoteConnection!: RemoteConnection
  updateBlueTeamBase(e: any) {
    this.blue = e.data
  }

  updateRedTeamBase(e: any) {
    this.red = e.data
  }

  updateStatus(e: any) {
    this.lastUpdateTime = Date.now()
    this.status = e.data
  }
  private interval: any
  mounted() {
    // @ts-ignore
    this.$refs.root.addEventListener('animationend', () => {
      this.animate = false
    })
    window.addEventListener('obsSourceActiveChanged', this.reanimate)
    this.RemoteConnection.addEventListener('updateBlueTeamBase', this.updateBlueTeamBase)
    this.RemoteConnection.addEventListener('updateRedTeamBase', this.updateRedTeamBase)
    this.RemoteConnection.addEventListener('updateTimer', this.updateStatus)
    this.RemoteConnection.addEventListener('connected', this.onConnect)
    if (this.RemoteConnection.getState() === WebSocket.OPEN) {
      this.onConnect()
    }
    this.interval = setInterval(this.calcTime, 100)
  }
  reanimate() {
    this.animate = true
  }
  onConnect() {
    this.RemoteConnection.call('blueTeamBase')
      .then((e) => {
        // @ts-ignore
        this.blue = e
      })
      .catch(console.error)
    this.RemoteConnection.call('redTeamBase')
      .then((e) => {
        // @ts-ignore
        this.red = e
      })
      .catch(console.error)
    this.RemoteConnection.call('timer')
      .then((e) => {
        // @ts-ignore
        this.status = e
      })
      .catch(console.error)
  }

  calcTime() {
    this.blueRestTime = Math.max(Math.floor((this.status.blueTeamTime - (Date.now() - this.lastUpdateTime)) / 1000), 0)
    this.redRestTime = Math.max(Math.floor((this.status.redTeamTime - (Date.now() - this.lastUpdateTime)) / 1000), 0)
  }

  beforeDestroy() {
    this.RemoteConnection.removeEventListener('updateBlueTeamBase', this.updateBlueTeamBase)
    this.RemoteConnection.removeEventListener('updateRedTeamBase', this.updateRedTeamBase)
    this.RemoteConnection.removeEventListener('updateTimer', this.updateStatus)
    this.RemoteConnection.removeEventListener('connected', this.onConnect)
    clearInterval(this.interval)
    window.removeEventListener('obsSourceActiveChanged', this.reanimate)
  }
  animate = true
}
</script>
