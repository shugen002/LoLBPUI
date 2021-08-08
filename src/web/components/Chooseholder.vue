<template>
  <div class="choose">
    <Player
      class="TeamBlue"
      v-for="(player, index) in blueTeam"
      :key="'blue' + index + 1"
      :style="{ 'grid-area': 'blue' + (index + 1), 'animation-delay': index * 0.1 + 's' }"
      :player="player"
    >
    </Player>

    <Player
      class="TeamRed"
      v-for="(player, index) in redTeam"
      :key="'red' + index + 1"
      :style="{ 'grid-area': 'red' + (index + 1), 'animation-delay': index * 0.1 + 's' }"
      :player="player"
    >
    </Player>
  </div>
</template>
<style lang="stylus" scoped>
.choose
  grid-area choose
  display grid
  grid-template-columns 410px 1fr 410px
  grid-template-rows 133px 133px 133px 133px 133px
  grid-gap 8px 0
  grid-template-areas 'blue1 . red1' 'blue2 . red2' 'blue3 . red3' 'blue4 . red4' 'blue5 . red5'
</style>

<script lang="ts">
import { RemoteConnection } from '../RemoteConnection'
import { Component, Vue } from 'vue-property-decorator'

import Player from './Player.vue'

@Component({
  components: {
    Player
  }
})
export default class App extends Vue {
  teamlocation = ['top', 'jung', 'mid', 'bot', 'sup']
  blueTeam = []
  redTeam = []
  RemoteConnection!: RemoteConnection
  mounted() {
    this.RemoteConnection.addEventListener('updateBluePlayer', this.updateBluePlayer)
    this.RemoteConnection.addEventListener('updateRedPlayer', this.updateRedPlayer)
    this.RemoteConnection.addEventListener('connected', this.onConnect)
    if (this.RemoteConnection.getState() === WebSocket.OPEN) {
      this.onConnect()
    }
  }
  beforeDestroy() {
    this.RemoteConnection.removeEventListener('updateBluePlayer', this.updateBluePlayer)
    this.RemoteConnection.removeEventListener('updateRedPlayer', this.updateRedPlayer)
    this.RemoteConnection.removeEventListener('connected', this.onConnect)
  }
  onConnect() {
    this.RemoteConnection.call('redPlayer')
      .then((e: any) => {
        this.teamlocation.forEach((v, i) => {
          if (e[i]) {
            e.pos = v
          }
        })
        this.redTeam = e
      })
      .catch(console.error)
    this.RemoteConnection.call('bluePlayer')
      .then((e: any) => {
        this.teamlocation.forEach((v, i) => {
          if (e[i]) {
            e.pos = v
          }
        })
        this.blueTeam = e
      })
      .catch(console.error)
  }
  updateRedPlayer(e: any) {
    this.redTeam = e.data
  }
  updateBluePlayer(e: any) {
    this.blueTeam = e.data
  }
}
</script>
