<template>
  <div class="teamStatus">
    <Card>
      <p slot="title">蓝队队员</p>
      <Card v-for="(player, index) in blueplayer" :key="'a' + index">
        <p>玩家名：{{ player.name }}</p>
        <p>英雄：{{ player.champion }}</p>
        <p>召唤师技能：{{ player.spell1 ? player.spell1.name : '' }} {{ player.spell2 ? player.spell2.name : '' }}</p>
        <p>状态：{{ player.active ? '活动中' : '等待中' }}</p>
      </Card>
    </Card>
    <Card>
      <p slot="title">红队队员</p>
      <Card v-for="(player, index) in redplayer" :key="'a' + index">
        <p>玩家名：{{ player.name }}</p>
        <p>英雄：{{ player.champion }}</p>
        <p>召唤师技能：{{ player.spell1 ? player.spell1.name : '' }} {{ player.spell2 ? player.spell2.name : '' }}</p>
        <p>状态：{{ player.active ? '活动中' : '等待中' }}</p>
      </Card>
    </Card>
  </div>
</template>
<style scoped>
.teamStatus {
  display: grid;
  grid-template-columns: 50% 50%;
}
</style>

<script>
export default {
  data() {
    return {
      blueplayer: [],
      redplayer: [],
      champions: {},
      spells: null,
      summoner: {
        0: {
          displayName: ''
        }
      }
    }
  },
  mounted() {
    window.API.LCUService.ApiEvent.addEventListener('/lol-champ-select/v1/session', this.onUpdate)
    window.API.WebSocketServerService.broadcast('updateBluePlayer', this.blueplayer)
    window.API.WebSocketServerService.setAutoResponse('bluePlayer', this.blueplayer)
    window.API.WebSocketServerService.broadcast('updateRedPlayer', this.redplayer)
    window.API.WebSocketServerService.setAutoResponse('redPlayer', this.redplayer)
  },
  watch: {
    blueplayer: {
      handler(newval, oldval) {
        window.API.WebSocketServerService.broadcast('updateBluePlayer', this.blueplayer)
        window.API.WebSocketServerService.setAutoResponse('bluePlayer', this.blueplayer)
      },
      deep: true
    },
    redplayer: {
      handler(newval, oldval) {
        window.API.WebSocketServerService.broadcast('updateRedPlayer', this.redplayer)
        window.API.WebSocketServerService.setAutoResponse('redPlayer', this.redplayer)
      },
      deep: true
    }
  },
  methods: {
    onUpdate(e) {
      if (this.spells == null) {
        window.API.LCUService.call('lol-game-data/assets/v1/summoner-spells.json')
          .then((e) => {
            if (e.code == 0) {
              let result = {}
              e.data.forEach((item) => {
                result[item.id] = { name: item.name, icon: item.iconPath.split('/').pop() }
              })
              this.spells = result
            }
          })
          .catch((e) => {
            console.error(e)
          })
      }
      let edata = e.data
      if (edata.myTeam[0]) {
        if (edata.myTeam[0].team === 1) {
          this.blueplayer = edata.myTeam.map(this.transformPlayer)
        } else {
          this.redplayer = edata.myTeam.map(this.transformPlayer)
        }
      }
      if (edata.theirTeam[0]) {
        if (edata.theirTeam[0].team === 1) {
          this.blueplayer = edata.theirTeam.map(this.transformPlayer)
        } else {
          this.redplayer = edata.theirTeam.map(this.transformPlayer)
        }
      }
      if (edata.theirTeam.length === 0 && edata.myTeam.length === 0) {
        this.blueplayer = []
        this.redplayer = []
      }
      if (edata.timer.phase === 'BAN_PICK') {
        let actions = []
        edata.actions.forEach((action) => {
          if (Array.isArray(action)) {
            action.forEach((e) => {
              actions.push(e)
            })
          } else {
            action.push(action)
          }
        })
        let lastaction = actions[actions.length - 1]
        if (typeof lastaction !== 'undefined') {
          if (lastaction.isInProgress) {
            this.blueplayer.forEach((e) => {
              if (e.cellId === lastaction.actorCellId) {
                e.active = true
              }
            })
            this.redplayer.forEach((e) => {
              if (e.cellId === lastaction.actorCellId) {
                e.active = true
              }
            })
          }
        }
      }
    },
    async getSummonerInfo(id) {
      if (this.summoner[id]) {
        return this.summoner[id]
      } else {
        let result = await window.API.LCUService.call(`lol-summoner/v1/summoners/${id}`)
        this.$set(this.summoner, id, result.data)
        return this.summoner[id]
      }
    },
    findSpell(id) {
      return this.spells == null ? {} : this.spells[id] || {}
    },
    transformPlayer(e) {
      let spell1 = this.findSpell(e.spell1Id)
      let spell2 = this.findSpell(e.spell2Id)
      let player = {
        name: '',
        cellId: e.cellId,
        championId: e.championId,
        spell1Id: e.spell1Id,
        spell2Id: e.spell2Id,
        spell1: spell1,
        spell2: spell2,
        active: false
      }
      this.getSummonerInfo(e.summonerId).then((info) => {
        this.$set(player, 'name', info.displayName)
      })
      return player
    }
  },
  beforeDestroy() {
    window.API.LCUService.ApiEvent.removeEventListener('/lol-champ-select/v1/session', this.onUpdate)
  }
}
</script>
