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
              <v-btn color="error" outlined width="120">
                Nuevo
              </v-btn>
               <v-btn color="error" outlined width="120">
                Indexar
              </v-btn>
            </div>
            <div class="vertical-line">
            </div>
            <div id="news" class="px-4">
              <v-tabs color="red" dense height="30" background-color="#121212">
                <v-tab>Tutorial</v-tab>
                <v-tab>Features</v-tab>
                <v-tab>Update</v-tab>
              </v-tabs>
            </div>
          </div>
          <div id="maps" class="px-4">
            <v-tabs color="red" dense height="30" background-color="#121212">
              <v-tab>All</v-tab>
              <v-tab>Recent</v-tab>
              <v-tab>Favourites</v-tab>
            </v-tabs>
          </div>
        </div>
      </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'HomeWin',

  components: {
  },

  data: () => ({
    drawer: false,
  }),
  methods: {
  },
  watch: {
  },
  async created() {
  }
};
</script>

<style scoped>
  ::-webkit-scrollbar {
    display: none;
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
  #maps {
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
</style>