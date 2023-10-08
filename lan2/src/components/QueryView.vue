<template>
  <v-container>
    <div id="query">
      <div id="filter">
        <v-card width="100%" height="100%" flat class="pa-3">
          <div>
            <v-autocomplete
              v-model="select"
              :loading="loading"
              :items="objects"
              item-value="id"
              cache-items
              flat
              hide-no-data
              hide-details
              dense
              label="Search for object"
              outlined
              class="mt-3"
              item-text="name"
              @input="selectItem">
              <template v-slot:item="{ item }">
                {{ item.name }}
              </template>
            </v-autocomplete>
            <v-combobox
              :items="categories"
              item-value="id"
              item-text="name"
              label="Tags"
              chips
              multiple
              outlined
              dense
              class="mt-3">
            </v-combobox>
            <div class="d-flex align-center justify-center mt-n3">
              <v-spacer></v-spacer>
              <v-btn-toggle v-model="objectType" dense>
                <v-btn>
                  <v-icon>mdi-pound</v-icon>
                </v-btn>

                <v-btn>
                  <v-icon>mdi-code-brackets</v-icon>
                </v-btn>

                <v-btn>
                  <v-icon>mdi-transit-connection-horizontal</v-icon>
                </v-btn>
              </v-btn-toggle>
              <v-spacer v-if="objectType==1"></v-spacer>
              <v-btn-toggle v-model="contentType" dense v-if="objectType==1">
                <v-btn>
                  <v-icon>mdi-file</v-icon>
                </v-btn>

                <v-btn>
                  <v-icon>mdi-image</v-icon>
                </v-btn>

                <v-btn>
                  <v-icon>mdi-link</v-icon>
                </v-btn>
              </v-btn-toggle>
              <v-spacer></v-spacer>
            </div>
          </div>
          <v-card-text>
            <div v-for="item in filtered" :key="item.id" @click="selectedQuery=item"  :style="{ color: getTextColor(item) }">{{ item.name }}#{{ item.id }}</div>
          </v-card-text>
        </v-card>
      </div>
      <div id="data">
        <v-card width="100%" height="100%" flat class="pa-3">
          <v-card-title>
            <div class="text-h4" :style="{ color: getTextColor(selectedQuery) }">
              {{ selectedQuery.name }}
            </div>
          </v-card-title>
          <v-card-text v-if="selectedQuery.data">
            <div class="text">
              Id: {{ selectedQuery.id }}
            </div>
            <div class="text">
              Data: {{ selectedQuery.data }}
            </div>
            <div class="text">
              Relations: {{ selectedQuery.relations }}
            </div>
            <div class="text">
              Categories: {{ selectedQuery.categories }}
            </div>
          </v-card-text>
          <v-card-text v-if="selectedQuery.objects">
              <div class="text">
                Id: {{ selectedQuery.id }}
              </div>
              <div class="text">
                Objects: {{ selectedQuery.objects }}
              </div>
          </v-card-text>
          <v-card-text v-if="selectedQuery.subject">
              <div class="text">
                Id: {{ selectedQuery.id }}
              </div>
              <div class="text">
                Subject: {{ selectedQuery.subject.name }}
              </div>
              <div class="text">
                Object: {{ selectedQuery.object.name }}
              </div>
              <div class="text">
                Categories: {{ selectedQuery.categories }}
              </div>
          </v-card-text>
        </v-card>
      </div>
    </div>
  </v-container>
</template>

<script>
  import EventBus from '@/event-bus'

  export default {
    name: 'QueryView',

    data: () => ({
      selectedQuery: [],
      relations: null,
      categories: null,
      selectingArea: null,
      objects: [],
      loading: false,
      select: null,

      objectType: null,
      contentType: null,
    }),

    props: {
      conceptsData: {
          required: true,
      },
      relationsData: {
          required: true,
      },
      categoriesData: {
          required: true,
      }
    },

    methods: {
      getTextColor(item) {
        if (item) {
          if (item.objects) {
            return this.$vuetify.theme.themes.dark.error;
          } else if (item.subject) {
            return this.$vuetify.theme.themes.dark.primary;
          } else {
            return this.$vuetify.theme.themes.dark.success;
          }
        }
        return 'white'
      },
      getObjectById(id) {
        for(let i=0; i<this.objects.length; i++) {
          if (this.objects[i].id==id) {
            return this.objects[i]
          }
        }
      },

      selectItem() {
        this.selectedQuery = this.getObjectById(this.select)
        this.select = null
      },
      setQuery(object) {
        console.log(3)
        this.selectedQuery = object
      }
    },

    computed: {
      filtered() {
        if (this.objectType===0) {
          return this.categories
        }
        else if (this.objectType===1) {
          if (this.contentType===0) {
            return this.concepts.filter((concept) => concept.data=='file')
          }
          if (this.contentType==2) {
            return this.concepts.filter((concept) => concept.data=='image') 
          }
          if (this.contentType===3) {
            return this.concepts.filter((concept) => concept.data=='link') 
          }
          else {
            return this.concepts
          }
        }
        else if (this.objectType===2) {
          return this.relations
        }
        else {
          return this.objects
        }
      }
    },

    created() {
      this.concepts = this.conceptsData
      this.relations = this.relationsData
      this.categories = this.categoriesData

      EventBus.$on('setQuery', this.setQuery)

      this.objects = [...this.concepts, ...this.relations, ...this.categories]
      console.log(this.$vuetify.theme)
    }
  }
</script>

<style scoped>
  #query {
    height: calc(100vh - 80px);
    width: 100%;
    cursor: crosshair;
    position: relative;
    display: flex;
    gap: 20px;
    padding: 20px;
  }
  #filter {
    flex: 1;
    height: 100%;
  }
  #data {
    flex: 1;
    height: 100%;
  }
</style>
