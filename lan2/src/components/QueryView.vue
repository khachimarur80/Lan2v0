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
              <v-btn-toggle v-model="objectType" dense>
                <v-btn>
                  <v-icon color="red">mdi-pound</v-icon>
                </v-btn>

                <v-btn>
                  <v-icon color="green">mdi-code-brackets</v-icon>
                </v-btn>

                <v-btn>
                  <v-icon color="blue">mdi-transit-connection-horizontal</v-icon>
                </v-btn>

                <v-btn>
                  <v-icon color="yellow">
                    mdi-code-tags
                  </v-icon>
                </v-btn>

                <v-btn>
                  <v-icon color="purple">
                    mdi-source-fork
                  </v-icon>
                </v-btn>

                <v-btn>
                  <v-icon color="orange">
                    mdi-skew-more
                  </v-icon>
                </v-btn>
              </v-btn-toggle>
            </div>
            <div class="d-flex align-center justify-center mt-3">
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
            </div>
          </div>
          <v-card-text>
            <div v-for="item in filtered" :key="item.id" @click="setQuery(item)"  :style="{ color: getTextColor(item) }" class="d-flex align-center justify-space-between">
              <div class="text-body-2" v-if="item.name">
                {{ item.name }}
              </div>
              <div class="text-body-2" v-else>
                #{{ item.id }}
              </div>
              <v-btn icon dense x-small color="orange" @mousedown.stop @click="deleteItem(item)">
                <v-icon>
                  mdi-close
                </v-icon>
              </v-btn>
            </div>
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
          <v-card-text v-if="selectedQuery.objectType=='concept'">
            <div class="text-body-1">
              Id: {{ selectedQuery.id }}
            </div>
            <div class="text-body-1">
              Data: {{ selectedQuery.data }}
            </div>
            <div class="text-body-1">
              Relations: {{ selectedQuery.relations }}
            </div>
            <div class="text-body-1">
              Categories: {{ selectedQuery.categories }}
            </div>
          </v-card-text>
          <v-card-text v-if="selectedQuery.objectType=='category'">
              <div class="text-body-1">
                Id: {{ selectedQuery.id }}
              </div>
              <div class="text-body-1">
                Objects: {{ selectedQuery.objects }}
              </div>
          </v-card-text>
          <v-card-text v-if="selectedQuery.objectType=='relation'">
              <div class="text-body-1">
                Id: {{ selectedQuery.id }}
              </div>
              <div class="text-body-1">
                Subject: {{ selectedQuery.subject.name }}
              </div>
              <div class="text-body-1">
                Object: {{ selectedQuery.object.name }}
              </div>
              <div class="text-body-1">
                Categories: {{ selectedQuery.categories }}
              </div>
          </v-card-text>
          <v-card-text v-if="selectedQuery.objectType=='statement'">
              <div class="text-body-1">
                Id: {{ selectedQuery.id }}
              </div>
              <div class="text-body-1">
                Type: {{ selectedQuery.type }}
              </div>
              <div class="text-body-1">
                Items: 
                <ul v-for="(item, i) in selectedQuery.items" :key="i">
                  {{ item[0] }}
                </ul>
              </div>
          </v-card-text>
          <v-card-text v-if="selectedQuery.objectType=='condition'">
              <div class="text-body-1">
                Id: {{ selectedQuery.id }}
              </div>
              <div class="text-body-1">
                Items:
                <ul v-for="(item, i) in selectedQuery.items" :key="i">
                  <span v-if="!item[1]">{{ item[0].name }}</span>
                  <span v-else>{{ item[0] }}</span>
                </ul>
              </div>
          </v-card-text>
          <v-card-text v-if="selectedQuery.objectType=='action'">
              <div class="text-body-1">
                Id: {{ selectedQuery.id }}
              </div>
              <div class="text-body-1">
                <!--Table-->
                Condition: {{ selectedQuery.condition }}
              </div>
          </v-card-text>
        </v-card>
      </div>
    </div>
  </v-container>
</template>

<script>
  import EventBus from '@/event-bus'
  import colors from 'vuetify/lib/util/colors';

  export default {
    name: 'QueryView',

    data: () => ({
      selectedQuery: [],
      selectingArea: null,
      loading: false,
      select: null,

      objectType: null,
      contentType: null,
    }),

    props: {
      concepts: {
          required: true,
      },
      relations: {
          required: true,
      },
      categories: {
          required: true,
      },
      actions: {
          required: true,
      },
      conditions: {
          required: true,
      },
      statements: {
          required: true,
      }
    },

    methods: {
      getTextColor(item) {
        if (item) {
          if (item.objectType == 'category') {
            return colors.red.base;
          }
          else if (item.objectType == 'relation') {
            return colors.blue.base;
          }
          else if (item.objectType == 'statement') {
            return colors.yellow.base;
          }
          else if (item.objectType == 'condition') {
            return colors.purple.base;
          }
          else if (item.objectType == 'action') {
            return colors.orange.base;
          }
          else {
            return colors.green.base;
          }
        }
        return 'white'
      },
      getObjectById(id) {
        for(let i=0; i<this.concepts.length; i++) {
          if (this.concepts[i].id==id) {
            return this.concepts[i]
          }
        }
        for(let i=0; i<this.statements.length; i++) {
          if (this.statements[i].id==id) {
            return this.statements[i]
          }
        }
        for(let i=0; i<this.actions.length; i++) {
          if (this.actions[i].id==id) {
            return this.actions[i]
          }
        }
        for(let i=0; i<this.conditions.length; i++) {
          if (this.conditions[i].id==id) {
            return this.conditions[i]
          }
        }
        for(let i=0; i<this.relations.length; i++) {
          if (this.relations[i].id==id) {
            return this.relations[i]
          }
        }
      },

      selectItem() {
        this.selectedQuery = this.getObjectById(this.select)
        this.select = null
      },
      setQuery(object) {
        this.selectedQuery = object
      },
      deleteItem(item) {
        EventBus.$emit('deleteItem', item)
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
          if (this.contentType==1) {
            return this.concepts.filter((concept) => concept.data=='image') 
          }
          if (this.contentType===2) {
            return this.concepts.filter((concept) => concept.data=='link') 
          }
          else {
            return this.concepts
          }
        }
        else if (this.objectType===2) {
          return this.relations
        }
        else if (this.objectType===3) {
          return this.statements
        }
        else if (this.objectType==4) {
          return this.conditions
        }
        else if (this.objectType===5) {
          return this.actions
        }
        else {
          return [...this.concepts, ...this.relations, ...this.categories, ...this.statements, ...this.conditions, ...this.actions]
        }
      },
      objects() {
        return [...this.concepts, ...this.relations, ...this.categories, ...this.statements, ...this.conditions, ...this.actions]
      }
    },

    created() {
      EventBus.$on('setQuery', this.setQuery)
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
