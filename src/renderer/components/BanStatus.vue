<template>
  <div class="ban-container">
    <Card>
      <p slot="title">蓝队BAN</p>
      <p v-for="(item, index) in blueBan" :key="'b' + index">
        BAN{{ index }} {{ item.champion }} {{ item.active ? '选择中' : '' }}
      </p>
    </Card>
    <Card>
      <p slot="title">红队BAN</p>
      <p v-for="(item, index) in redBan" :key="'r' + index">
        BAN{{ index }} {{ item.champion }} {{ item.active ? '选择中' : '' }}
      </p>
    </Card>
  </div>
</template>
<style scoped>
.ban-container {
  display: grid;
  grid-template-columns: 50% 50%;
}
</style>
<script>
export default {
  data() {
    return {
      blueBan: [],
      redBan: []
    }
  },
  mounted() {
    window.API.WebSocketServerService.broadcast('updateBlueBan', this.blueBan)
    window.API.WebSocketServerService.setAutoResponse('blueBan', this.blueBan)
    window.API.WebSocketServerService.broadcast('updateRedBan', this.redBan)
    window.API.WebSocketServerService.setAutoResponse('redBan', this.redBan)
    window.API.LCUService.ApiEvent.addEventListener('/lol-champ-select/v1/session', this.onUpdate)
  },
  watch: {
    blueBan: {
      handler(newval, oldval) {
        if (JSON.stringify(newval) !== JSON.stringify(oldval)) {
          window.API.WebSocketServerService.broadcast('updateBlueBan', this.blueBan)
          window.API.WebSocketServerService.setAutoResponse('blueBan', this.blueBan)
        }
      },
      deep: true
    },
    redBan: {
      handler(newval, oldval) {
        if (JSON.stringify(newval) !== JSON.stringify(oldval)) {
          window.API.WebSocketServerService.broadcast('updateRedBan', this.redBan)
          window.API.WebSocketServerService.setAutoResponse('redBan', this.redBan)
        }
      },
      deep: true
    }
  },
  methods: {
    onUpdate(e) {
      let event = e.data
      let num = event.bans.numBans / 2
      let blueActorId = []
      let redActorId = []
      event.myTeam.forEach((e) => {
        if (e.team === 1) {
          blueActorId.push(e.cellId)
        } else {
          redActorId.push(e.cellId)
        }
      })
      event.theirTeam.forEach((e) => {
        if (e.team === 1) {
          blueActorId.push(e.cellId)
        } else {
          redActorId.push(e.cellId)
        }
      })
      let blue = 'myTeamBans'
      let red = 'theirTeamBans'
      if (event.myTeam[0] && event.myTeam[0].team === 1) {
        blue = 'myTeamBans'
        red = 'theirTeamBans'
      } else if (event.myTeam[0] && event.myTeam[0].team === 2) {
        blue = 'theirTeamBans'
        red = 'myTeamBans'
      }
      let blueBan = []
      let redBan = []
      event.bans[blue].forEach((e) => {
        blueBan.push({
          champion: e,
          active: false
        })
      })
      event.bans[red].forEach((e) => {
        redBan.push({
          champion: e,
          active: false
        })
      })

      if (event.timer.phase === 'BAN_PICK') {
        let actions = []
        event.actions.forEach((action) => {
          if (Array.isArray(action)) {
            action.forEach((e) => {
              actions.push(e)
            })
          } else {
            action.push(action)
          }
        })
        let lastaction = actions[actions.length - 1]
        if (typeof lastaction !== 'undefined' && lastaction.type === 'ban' && lastaction.isInProgress) {
          if (blueActorId.indexOf(lastaction.actorCellId) !== -1) {
            blueBan.push({
              champion: lastaction.championId,
              active: true
            })
          }
          if (redActorId.indexOf(lastaction.actorCellId) !== -1) {
            redBan.push({
              champion: lastaction.championId,
              active: true
            })
          }
        }
      }
      while (blueBan.length < num) {
        blueBan.push({ active: false })
      }
      while (redBan.length < num) {
        redBan.push({ active: false })
      }
      this.blueBan = blueBan
      this.redBan = redBan
    }
  },
  beforeDestroy() {
    window.API.LCUService.ApiEvent.removeEventListener('/lol-champ-select/v1/session', this.onUpdate)
  }
}
</script>
