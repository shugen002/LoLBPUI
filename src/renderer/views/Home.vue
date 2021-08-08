<template>
  <div class="home-container">
    <div class="option-container">
      <TeamSettings></TeamSettings>
      <BanStatus></BanStatus>
      <PickStatus></PickStatus>
    </div>
    <div class="connection-container">
      <ClientSelector></ClientSelector>
      <LinkStatus></LinkStatus>
      <Timer></Timer>
    </div>
  </div>
</template>

<script>
import LinkStatus from '../components/LinkStatus.vue'
import ClientSelector from '../components/ClientSelector.vue'
import TeamSettings from '../components/TeamSettings.vue'
import Timer from '../components/Timer.vue'
import PickStatus from '../components/PickStatus.vue'
import BanStatus from '../components/BanStatus.vue'

export default {
  name: 'Home',
  components: {
    LinkStatus,
    ClientSelector,
    TeamSettings,
    Timer,
    PickStatus,
    BanStatus
  },
  data() {
    return {}
  },
  mounted() {},
  watch: {},
  methods: {},
  beforeDestroy() {}
}
</script>
<style scoped>
.home-container {
  width: 100%;
  height: 100%;
  padding: 5px;
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 1fr 320px;
  grid-template-areas: 'option connection';
  background-color: cadetblue;
  gap: 5px;
}
.option-container {
  height: 100%;
  overflow-y: auto;
}
</style>
