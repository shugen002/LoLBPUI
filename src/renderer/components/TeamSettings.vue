<template>
  <Card>
    <p slot="title">队伍设置</p>
    <div class="team-container">
      <div>
        <h2>蓝队</h2>
        <Form label-position="left" :label-width="100">
          <FormItem label="图标">
            <Upload accept="image/*" :before-upload="blueTeamIconUpload" type="drag" action="">
              <div style="height: 150px">
                <img v-if="blue.icon" style="max-width: 128px; max-height: 128px" :src="blue.icon" />
                <div v-else style="padding: 20px 0">
                  <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                  <p>Click or drag files here to upload</p>
                </div>
              </div>
            </Upload>
          </FormItem>
          <FormItem label="队伍名">
            <Input v-model="blue.name" />
          </FormItem>
          <FormItem label="分数">
            <Input type="number" v-model="blue.score" />
          </FormItem>
        </Form>
      </div>
      <div>
        <h2>红队</h2>
        <Form label-position="left" :label-width="100">
          <FormItem label="图标">
            <Upload accept="image/*" :before-upload="redTeamIconUpload" type="drag" action="">
              <div style="height: 150px">
                <img v-if="red.icon" style="max-width: 128px; max-height: 128px" :src="red.icon" />
                <div v-else style="padding: 20px 0">
                  <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                  <p>Click or drag files here to upload</p>
                </div>
              </div>
            </Upload>
          </FormItem>
          <FormItem label="队伍名">
            <Input v-model="red.name" />
          </FormItem>
          <FormItem label="分数">
            <Input type="number" v-model="red.score" />
          </FormItem>
        </Form>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.team-container {
  width: 100%;
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 48% 48%;
  gap: 2%;
}
</style>
<script>
export default {
  data() {
    return {
      blue: {
        name: '',
        icon: null,
        score: 0
      },
      red: {
        name: '',
        icon: null,
        score: 0
      }
    }
  },
  mounted() {
    window.API.WebSocketServerService.setAutoResponse('blueTeamBase', this.blue)
    window.API.WebSocketServerService.setAutoResponse('redTeamBase', this.red)
    window.API.WebSocketServerService.broadcast('updateBlueTeamBase', this.blue)
    window.API.WebSocketServerService.broadcast('updateRedTeamBase', this.red)
  },
  watch: {
    blue: {
      handler(newVal, oldVal) {
        window.API.WebSocketServerService.broadcast('updateBlueTeamBase', this.blue)
        window.API.WebSocketServerService.setAutoResponse('blueTeamBase', this.blue)
      },
      deep: true
    },
    red: {
      handler(newVal, oldVal) {
        window.API.WebSocketServerService.broadcast('updateRedTeamBase', this.red)
        window.API.WebSocketServerService.setAutoResponse('redTeamBase', this.red)
      },
      deep: true
    }
  },
  methods: {
    blueTeamIconUpload(file) {
      this._blueTeamIconUpload(file)
      return false
    },
    redTeamIconUpload(file) {
      this._redTeamIconUpload(file)
      return false
    },
    async _blueTeamIconUpload(file) {
      try {
        let result = await this.readFile(file)
        this.blue.icon = result.data
      } catch (error) {}
    },
    async _redTeamIconUpload(file) {
      try {
        let result = await this.readFile(file)
        this.red.icon = result.data
      } catch (error) {}
    },
    async readFile(file) {
      var p = new Promise(function (resolve, reject) {
        var reader = new FileReader()
        reader.onload = function (e) {
          resolve({
            data: e.target.result
          })
        }
        reader.readAsDataURL(file)
      })
      return await p
    }
  }
}
</script>
