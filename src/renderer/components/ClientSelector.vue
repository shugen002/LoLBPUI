<template>
  <Card>
    <p slot="title">客户端链接</p>
    <div>
      <Button :disabled="selected" :loading="loading" icon="ios-cloud-upload-outline" @click="selectClient"
        >选择LOL客户端</Button
      >
      <p>请选择类似 C:\Riot Games\League of Legends\LeagueClient.exe 这样的位置。</p>
      <p>当前选择：{{ path }}</p>
      <p><Button @click="forceReconnect">强制重连</Button></p>
    </div>
  </Card>
</template>
<script>
import debounce from 'lodash.debounce'
export default {
  data() {
    return {
      loading: false,
      path: '',
      selected: false,
      lockDebounce: null,
      failTime: 0,
      force: false
    }
  },
  mounted() {
    this.lockDebounce = debounce(this.lockChange.bind(this), 1000, {
      leading: true
    })
    window.API.FileService.addEventListener('watch', this.fileChange)
    window.API.LCUService.addEventListener('close', this.onClose)
    window.API.LCUService.addEventListener('open', this.onOpen)
    window.API.LCUService.addEventListener('welcome', this.onWelcome)
  },
  methods: {
    selectClient() {
      var fileinput = document.createElement('input')
      fileinput.type = 'file'
      fileinput.accept = ['.exe']
      fileinput.addEventListener('change', () => {
        if (fileinput.files && fileinput.files.length > 0) {
          let file = fileinput.files[0]
          if (file.path.endsWith('Riot Client\\RiotClientServices.exe')) {
            let temp = file.path
            temp = temp.replace('Riot Client\\RiotClientServices.exe', 'League of Legends\\LeagueClient.exe')
            this.clientchange({
              path: temp
            })
          } else {
            this.clientchange(file)
          }
        }
      })
      fileinput.click()
    },
    clientchange(file) {
      this.loading = true
      var paths = file.path.split('\\')
      paths.pop()
      window.API.FileService.verifyLoLPath(paths.join('\\')).then((result) => {
        if (result.data) {
          this.path = paths.join('\\')
          this.selected = true
          window.API.FileService.watchFile(paths.join('\\'))
          this.lockDebounce(paths.join('\\'))
        } else {
          this.$Modal.warning({
            title: '客户端选择',
            content: '<p>无效的客户端位置</p>'
          })
        }
        this.loading = false
      })
      this.failTime = 0
    },
    fileChange(event) {
      if (event.data.filename === 'lockfile') {
        this.lockDebounce(event.data.path)
      }
    },
    async lockChange(path) {
      if (this.force || (await window.API.LCUService.getState()).data >= 2) {
        this.force = false
        let { code, data } = await window.API.FileService.readText(path + '\\lockfile')

        if (code === 0) {
          let lock = this.praseLockFile(data)
          window.API.LCUService.connect('127.0.0.1', lock.port, lock.password)
        }
      }
    },
    praseLockFile(str) {
      var parts = str.split(':')
      return {
        process: parts[0],
        PID: Number(parts[1]),
        port: Number(parts[2]),
        password: parts[3],
        protocol: parts[4]
      }
    },
    forceReconnect() {
      this.force = true
      this.lockDebounce(this.path)
    },
    /**
     * @param {File} file
     */
    onClose() {
      console.log('close', this.failTime)
      if (this.failTime < 15) {
        this.failTime++
        this.lockDebounce(this.path)
      }
    },
    onOpen() {
      this.failTime = 0
    },
    onWelcome() {}
  },
  beforeDestroy() {
    window.API.FileService.removeEventListener('watch', this._lockChange)
    window.API.LCUService.removeEventListener('close', this.onClose)
    window.API.LCUService.removeEventListener('open', this.onOpen)
    window.API.LCUService.removeEventListener('welcome', this.onWelcome)
  }
}
</script>
