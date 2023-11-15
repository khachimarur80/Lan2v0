<template>
  <v-app>
      <v-main>
        <div id="titlebar" class="d-flex pt-2 pr-2">
          <v-spacer></v-spacer>
          <v-btn icon>
            <v-icon>
              mdi-cog
            </v-icon>
          </v-btn>
        </div>
        <div class="text-h2 text-center red-text">
          Lan2
        </div>
        <div id="contents">
          <div id="menu" class="px-4">
            <div id="actions">
              <v-dialog v-model="newLanImageForm.show" width="300" v-if="user">
                <template v-slot:activator="{on, attrs}">
                  <v-btn color="error" outlined width="120" v-on="on" v-bind="attrs" style="border-radius: 0px;" elevation="0">
                    Nuevo
                  </v-btn>
                </template>
                <v-card>
                  <v-card-title>
                    Create new lan
                  </v-card-title>
                  <v-card-text>
                    <div class="d-flex align-center justify-center">
                      <v-icon class="pa-1">
                        mdi-file
                      </v-icon>
                      <v-text-field 
                        v-model="newLanImageForm.name" 
                        label="Lan name ..."
                        clearable
                        hide-details
                        dense>
                      </v-text-field>
                    </div>
                    <br>
                    <div class="d-flex align-center justify-center">
                      <v-btn icon @click="setNewLanLocation">
                        <v-icon>
                          mdi-folder
                        </v-icon>
                      </v-btn>
                      <v-text-field 
                      v-model="newLanImageForm.location" 
                      readonly
                      hide-details
                      dense></v-text-field>
                    </div>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer>
                    </v-spacer>
                    <v-btn @click="cancelCreation" color="error" text>
                      Cancel
                    </v-btn>
                    <v-btn color="success" text :disabled="newLanImageFormValid" @click="createLan">
                      Create
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-dialog v-model="newLanIndexingForm.show" width="300" v-if="user">
                <template v-slot:activator="{on, attrs}">
                  <v-btn color="error" outlined width="120" v-on="on" v-bind="attrs" style="border-radius: 0px;" elevation="0">
                    Indexar
                  </v-btn>
                </template>
                <v-card>
                  <v-card-title>
                    Index new lan
                  </v-card-title>
                  <v-card-text>
                    <div class="d-flex align-center justify-center">
                      <v-btn icon @click="setIndexingLanLocation">
                        <v-icon>
                          mdi-folder
                        </v-icon>
                      </v-btn>
                      <v-text-field 
                      v-model="newLanIndexingForm.location" 
                      readonly
                      hide-details
                      dense></v-text-field>
                    </div>
                    <br>
                    <div class="d-flex align-center justify-center">
                      <v-icon class="pa-1">
                        mdi-file
                      </v-icon>
                      <v-text-field 
                        :value="newLanIndexingForm.name" 
                        hide-details
                        dense
                        readonly>
                      </v-text-field>
                    </div>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer>
                    </v-spacer>
                    <v-btn @click="cancelIndexing" color="error" text>
                      Cancel
                    </v-btn>
                    <v-btn color="success" text :disabled="indexingLanImageFormValid" @click="indexLan">
                      Add
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-snackbar v-model="showError">
                {{ error }}
                <template v-slot:action="{ attrs }">
                  <v-btn
                    color="red"
                    text
                    v-bind="attrs"
                    @click="showError = false"
                  >
                    Close
                  </v-btn>
                </template>
              </v-snackbar>
            </div>
            <div class="vertical-line">
            </div>
            <div id="news" class="px-4">
              <v-tabs color="red" dense height="30" class="dark-tabs">
                <v-tab>Tutorial</v-tab>
                <v-tab>Features</v-tab>
                <v-tab>Update</v-tab>
              </v-tabs>
            </div>
          </div>
          <div id="lans" class="px-4">
            <v-tabs color="red" height="30" v-model="lanFilter" class="dark-tabs">
              <v-tab>All</v-tab>
              <v-tab>Recent</v-tab>
              <v-tab>Favourites</v-tab>
            </v-tabs>
            <div class="lans-list py-3 px-1" v-if="user">
              <v-card height="120" width="120" v-for="(lan, i) in  user.lans" :key="i"  class="d-flex justify-center align-center glow" @click="openLan(lan)" style="border-radius: 0px;" elevation="0">
                <v-menu offset-y tile>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn 
                      absolute
                      icon 
                      small 
                      style="top: 5px; right: 5px"
                      v-bind="attrs"
                      v-on="on">
                      <v-icon>
                        mdi-dots-vertical
                      </v-icon>
                    </v-btn>
                  </template>
                  <div class="d-flex flex-column">
                    <v-btn 
                      dense
                      small 
                      tile
                      @click="openLan(lan)"
                      >
                      open
                    </v-btn>
                    <v-btn 
                      dense
                      small 
                      tile
                      @click="removeLan(lan)"
                      >
                      remove
                    </v-btn>
                  </div>
                </v-menu>
                <div class="text-h5">{{ lan.name }}</div>
              </v-card>
            </div>
          </div>
        </div>
      </v-main>
  </v-app>
</template>

<script>
// eslint-disable-next-line 
class LanImage {
  constructor() {
    this.name = ''
    this.location = ''
  }
}
// eslint-disable-next-line 
class User {
  constructor() {
    this.username = null
    this.github = null
    this.lans = []
    this.settings = null
  }
}

export default {
  name: 'HomeWin',

  components: {
  },

  data: () => ({
    user: null,
    viewSettings: false,

    newLanImageForm: {
      show: false,
      name: '',
      location: '',
    },

    newLanIndexingForm: {
      show: false,
      location: '',
      name: '',
    },

    lanFilter: 0,
    error: null,
    showError: false,
  }),
  methods: {
    openLan(lan) {
      window.electronAPI.openLan(lan)
    },
    removeLan(lan) {
      this.user.lans = this.user.lans.filter(obj => obj!=lan)

      window.electronAPI.saveUserData(this.user)
    },
    cancelIndexing() {
      this.newLanIndexingForm = {
        show: false,
        name: '',
        location: '',
      }
    },
    cancelCreation() {
      this.newLanImageForm = {
        show: false,
        name: '',
        location: '',
      }
    },


    async setNewLanLocation() {
      const message = await new Promise(resolve => {
        window.electronAPI.openFileBrowser('dir')
        window.electronAPI.response('open-file-browser-response', resolve)
      });

      this.newLanImageForm.location = message
    },
    async createLan() {
      const success = await new Promise(resolve => {
        window.electronAPI.createLan(this.newLanImageForm)
        window.electronAPI.response('lan-creation-response', resolve)
      });

      if (!success) {
        this.error = 'Folder with that name already exists!'
        this.showError = true
        this.cancelCreation()
        setTimeout(()=>{
          this.error = null
          this.showError = false
        }, 3000)
      }
      else {
        let newLanImage = new LanImage
        newLanImage.location = this.newLanImageForm.location
        newLanImage.name = this.newLanImageForm.name

        this.user.lans.push(newLanImage)

        window.electronAPI.saveUserData(this.user)

        this.cancelCreation()
      }
    },

    async setIndexingLanLocation() {
      const message = await new Promise(resolve => {
        window.electronAPI.openFileBrowser('dir')
        window.electronAPI.response('open-file-browser-response', resolve)
      });
      
      if (message) {
        let name = message.split('/').slice(-1)[0]

        this.newLanIndexingForm.name = name
        this.newLanIndexingForm.location = message.slice(0, -name.length-1)
      }
    },
    async indexLan() {
      let indexingLanImage = new LanImage
      indexingLanImage.location = this.newLanIndexingForm.location
      indexingLanImage.name = this.newLanIndexingForm.name

      this.user.lans.push(indexingLanImage)

      window.electronAPI.saveUserData(this.user)


      this.cancelIndexing()
    }
  },
  watch: {
  },
  async created() {
    const user = await new Promise(resolve => {
      window.electronAPI.getUserData()
      window.electronAPI.response('get-user-data-response', resolve)
    })

    this.user = user

    for (let i=0; i<this.user.lans.length; i++) {
      let valid = await new Promise(resolve => {
        window.electronAPI.verifyPath(this.user.lans[i].location)
        window.electronAPI.response('path-verification-response', resolve)
      })
      if (!valid) {
        this.user.lans.splice(i, 1)
      }
    }

    window.electronAPI.saveUserData(this.user)
  },
  computed : {
    newLanImageFormValid() {
      let valid = false
      if ((this.newLanImageForm.name) && (this.newLanImageForm.location)) {
        let existingLanLocations = this.user.lans.map(obj => obj.location+"/"+obj.name)
        let newLocation = this.newLanImageForm.location + "/" + this.newLanImageForm.name

        valid = !existingLanLocations.includes(newLocation)
      }
      return !valid
    },
    indexingLanImageFormValid() {
      let valid = false
      if ((this.newLanIndexingForm.name) && (this.newLanIndexingForm.location)) {
        let existingLanLocations = this.user.lans.map(obj => obj.location+"/"+obj.name)
        let newLocation = this.newLanIndexingForm.location + "/" + this.newLanIndexingForm.name
        
        valid = !existingLanLocations.includes(newLocation)
      }
      return !valid
    }
  }
};
</script>

<style scoped>
  ::-webkit-scrollbar {
    height: 0;
    width: 0;
  }
  body, html {
    height: 100vh;
    width: 100h;
    margin: 0px;
    padding: 0px;
    overflow: hidden;
  }

  #titlebar {
    width: 100%;
    height: 40px;
    -webkit-app-region: drag;
  }
  .red-text {
    color: var(--v-error-base);
  }
  #contents {
    height: calc(100% - 100px);
  }
  #menu {
    width: 100%;
    height: calc(50% - 20px);
    margin-bottom: 20px;
    display: flex;
  }
  #lans {
    width: 100%;
    height: 50%;
  }
  #actions {
    flex: 1;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    flex-direction: column;
  }
  #news {
    flex: 1;
  }
  .vertical-line {
    width: 0px;
    border: none;
    border-left: 1px solid var(--v-error-base);
    height: 100%;
  }
  .lans-list {
    height: calc(100% - 30px);
    display: flex;
    flex-wrap: wrap;
    overflow: scroll;
    gap: 10px;
  }

  .lans-list::-webkit-scrollbar {
    width: 5px;
  }

  .lans-list::-webkit-scrollbar-track {
    background: rgba(255, 0, 0, .1);
  }

  .lans-list::-webkit-scrollbar-thumb {
    background-color: var(--v-error-base);
    border-radius: 10px;
  }

  .glow {
    user-select: none;
  }
  .glow:hover {
    outline: 1px solid var(--v-error-base);
    cursor: pointer;
  }
</style>