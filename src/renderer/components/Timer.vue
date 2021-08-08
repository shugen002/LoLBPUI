<template>
  <Card class="timer-container">
    <p>总阶段：{{ timer.phase }}</p>
    <p>当前阶段： {{ status.phase }}</p>
    <Card>
      <div class="timer">
        <div>
          <p>蓝队</p>
          <h4>{{ blueRestTime }}</h4>
        </div>
        <div>
          <p>红队</p>
          <h4>{{ redRestTime }}</h4>
        </div>
      </div>
    </Card>
    <div class="action">
      <h3>最后操作</h3>
      <p>ID：{{ lastAction.id }}</p>
      <p>操作位置：{{ lastAction.actorCellId }}</p>
      <p>英雄：{{ lastAction.championId }}</p>
      <p>完成：{{ lastAction.completed }}</p>
      <p>类型： {{ lastAction.type }}</p>
      <p>pickTurn {{ lastAction.pickTurn }}</p>
      <p>isAllyAction {{ lastAction.isAllyAction }}</p>
      <p>正在进行中：{{ lastAction.isInProgress }}</p>
    </div>
  </Card>
</template>
<style scoped>
.timer {
  display: grid;
  grid-template-columns: 50% 50%;
}
</style>
<script>
export default {
  data() {
    return {
      lastAction: {},
      blueActorId: [],
      redActorId: [],
      timer: {},
      status: {
        blueTeamTime: 0,
        redTeamTime: 0,
        blueTiming: false,
        redTiming: false,
        phase: '',
        lastUpdateTime: 0
      },
      lastUpdateTime: 0,
      blueRestTime: 0,
      redRestTime: 0,
      interval: 0
    }
  },
  mounted() {
    window.API.LCUService.ApiEvent.addEventListener('/lol-champ-select/v1/session', this.onUpdate)
    window.API.WebSocketServerService.setAutoResponse('timer', this.status)
    window.API.WebSocketServerService.broadcast('updateTimer', this.status)
    this.interval = setInterval(this.calcTime, 100)
  },
  watch: {
    status: {
      handler(newval, oldval) {
        if (JSON.stringify(newval) !== JSON.stringify(oldval)) {
          window.API.WebSocketServerService.setAutoResponse('timer', this.status)
          window.API.WebSocketServerService.broadcast('updateTimer', this.status)
        }
      },
      deep: true
    }
  },
  methods: {
    onUpdate(e) {
      this.lastUpdateTime = Date.now()
      let event = e.data
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
      if (typeof lastaction !== 'undefined') {
        if (this.lastAction.id !== lastaction.id || this.timer.phase !== event.timer.phase) {
          let status = {
            blueTeamTime: 0,
            redTeamTime: 0,
            blueTiming: false,
            redTiming: false,
            phase: event.timer.phase,
            lastUpdateTime: Date.now()
          }
          if (event.timer.phase === 'BAN_PICK') {
            if (blueActorId.indexOf(lastaction.actorCellId) !== -1) {
              status.blueTiming = true
              status.blueTeamTime = event.timer.adjustedTimeLeftInPhase
            }
            if (redActorId.indexOf(lastaction.actorCellId) !== -1) {
              status.redTiming = true
              status.redTeamTime = event.timer.adjustedTimeLeftInPhase
            }
            if (lastaction.type === 'ban') {
              status.phase = `BAN PHASE ${lastaction.pickturn > 6 ? '2' : '1'}`
            }
            if (lastaction.type === 'pick') {
              status.phase = `PICK PHASE ${lastaction.pickturn > 6 ? '2' : '1'}`
            }
          } else {
            status.blueTiming = true
            status.blueTeamTime = event.timer.adjustedTimeLeftInPhase
            status.redTiming = true
            status.redTeamTime = event.timer.adjustedTimeLeftInPhase
          }
          this.status = status
        }

        this.lastAction = lastaction
      } else {
        this.lastAction = {}
        this.status = {
          blueTeamTime: 0,
          redTeamTime: 0,
          blueTiming: false,
          redTiming: false,
          phase: '',
          lastUpdateTime: 0
        }
      }
      this.blueActorId = blueActorId
      this.redActorId = redActorId
      this.timer = event.timer
    },
    calcTime() {
      this.blueRestTime = Math.max(
        Math.floor((this.status.blueTeamTime - (Date.now() - this.status.lastUpdateTime)) / 1000),
        0
      )
      this.redRestTime = Math.max(
        Math.floor((this.status.redTeamTime - (Date.now() - this.status.lastUpdateTime)) / 1000),
        0
      )
    }
  },
  beforeDestroy() {
    clearInterval(this.interval)
    window.API.LCUService.ApiEvent.removeEventListener('/lol-champ-select/v1/session', this.onUpdate)
  }
}
</script>
