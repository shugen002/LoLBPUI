<template>
  <span>
    {{ Math.floor(time / 60) ? Math.floor(time / 60) : '' }}:
    {{
      Math.floor(time % 60).toString().length >= 2
        ? Math.floor(time % 60).toString()
        : '0' + Math.floor(time % 60).toString()
    }}
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class App extends Vue {
  @Prop() private time!: string
}
</script>
