<template>
  <div class="banholder">
    <Ban
      class="TeamBlue"
      v-for="(ban, index) in blueBan"
      :key="'blue' + index + 1"
      :style="{ 'grid-area': 'blue' + (index + 1) }"
      :ban="ban"
    >
    </Ban>
    <Ban
      class="TeamRed"
      v-for="(ban, index) in redBan"
      :key="'red' + index + 1"
      :style="{ 'grid-area': 'red' + (index + 1) }"
      :ban="ban"
    >
    </Ban>
  </div>
</template>

<style lang="stylus" scoped>
.banholder
  grid-area ban
  display grid
  grid-template-columns 72px 125px 125px 125px 53px 125px 125px 1fr 125px 125px 53px 125px 125px 125px 72px
  grid-template-rows 1fr
  grid-template-areas '. blue1 blue2 blue3 . blue4 blue5 . red5 red4 . red3 red2 red1 .'
  grid-gap 5px
</style>

<script lang="ts">
import { RemoteConnection } from '../RemoteConnection'
import { Component, Vue } from 'vue-property-decorator'
import Ban from './Ban.vue'

@Component({
  components: {
    Ban
  }
})
export default class App extends Vue {
  blueBan = []
  redBan = []
  RemoteConnection!: RemoteConnection
  updateBlueBan(e: any) {
    this.blueBan = e.data
  }

  updateRedBan(e: any) {
    this.redBan = e.data
  }

  mounted() {
    this.RemoteConnection.addEventListener('updateBlueBan', this.updateBlueBan)
    this.RemoteConnection.addEventListener('updateRedBan', this.updateRedBan)
    this.RemoteConnection.addEventListener('connected', this.onConnect)
    if (this.RemoteConnection.getState() === WebSocket.OPEN) {
      this.onConnect()
    }
  }
  onConnect() {
    this.RemoteConnection.call('blueBan')
      .then((e: any) => {
        this.blueBan = e
      })
      .catch(console.error)
    this.RemoteConnection.call('redBan')
      .then((e: any) => {
        this.redBan = e
      })
      .catch(console.error)
  }

  beforeDestroy() {
    this.RemoteConnection.removeEventListener('updateBlueBan', this.updateBlueBan)
    this.RemoteConnection.removeEventListener('updateRedBan', this.updateRedBan)
    this.RemoteConnection.removeEventListener('connected', this.onConnect)
  }
}
</script>
