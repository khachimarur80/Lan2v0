<template>
  <div id="query">
      <div id="filter">
        <v-row dense no-gutters class="mt-1">
          <v-col cols="4" class="d-flex justify-center">
          </v-col>
          <v-col cols="4" class="d-flex align-center">
            <v-autocomplete
              v-model="select"
              :loading="loading"
              :items="filtered"
              item-value="id"
              :cache-items="false"
              flat
              hide-no-data
              hide-details
              dense
              label="Search for object"
              outlined
              item-text="name"
              @change="selectItem">
              <template v-slot:item="{ item }">
                <div color="red">{{ item.name }}</div>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="4" class="d-flex align-center">
            <v-icon v-if="objectType != null" :color="objectTypeColor" class="mx-2">
              {{ objectTypeIcon }}
            </v-icon>
            <v-icon v-if="(contentType != null) && (objectType == 1)" class="mx-2">
              {{ contentTypeIcon }}
            </v-icon>
          </v-col>
        </v-row>
      </div>
      <div id="data">
        <div v-for="(sentence, i) in sentences" :key="i">
          {{ sentence }}
        </div>
        <v-card width="50%" height="100%" flat class="pa-3 overflow-auto" v-if="selectedQuery.id">
          <v-card-title>
            <div class="text-h4">
              <input v-model="selectedQuery.name" :style="{ color: getTextColor(selectedQuery), outline: 'none', }" @input="saveData">
            </div>
            <div class="text-caption pl-1" :style="{ color: getTextColor(selectedQuery)}">
              #{{ selectedQuery.id }}
            </div>
            <v-btn icon dense color="red" absolute top right style="top: 28px" @click="deleteItem(selectedQuery)">
              <v-icon>
                mdi-delete-outline
              </v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text v-if="selectedQuery.objectType=='concept'">
            <v-divider class="my-1"></v-divider>
            <div class="text-h6 mb-2">
              Data type
            </div>
            <div style="width: 150px">
              <v-select v-model="selectedQuery.data" :items="dataTypes" solo dense hide-details @input="changeDataType">
              </v-select>
            </div>
            <v-divider class="my-1 mt-4"></v-divider>
            <div class="text-h6 mb-2">
              Relations
            </div>
            <div class="text-body-1">
              {{ selectedQuery.relations }}
            </div>
            <v-divider class="my-1 mt-4"></v-divider>
            <div class="text-h6 mb-2">
              Categories
            </div>
            <div class="text-body-1">
              {{ selectedQuery.categories }}
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
                Subject: {{ selectedQuery.subject }}
              </div>
              <div class="text-body-1">
                Object: {{ selectedQuery.object }}
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
        <v-card  width="300" v-if="!selectedQuery.id && objectType!=null">
          <div v-if="objectType==0">
            <v-card-title>
              Create category
            </v-card-title>
            <v-card-text>
              <v-text-field solo label="Category name ..." dense hide-details v-model="newCreation">
              </v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text color="red" @click="createObject" :disabled="newCreation==''">
                Create
              </v-btn>
            </v-card-actions>
          </div>
          <div v-if="objectType==1">
            <v-card-title>
              Create concept
            </v-card-title>
            <v-card-text class="pl-6">
              Type : 
              <v-icon v-if="contentType!=null">
                {{ contentTypeIcon }}
              </v-icon>
              <v-icon v-else>
                mdi-file
              </v-icon>
            </v-card-text>
            <v-card-text>
              <v-text-field solo label="Concept name ..." dense hide-details v-model="newCreation">
              </v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text color="green" @click="createObject" :disabled="newCreation==''">
                Create
              </v-btn>
            </v-card-actions>
          </div>
          <div v-if="objectType==2">
            <v-card-title>
              Create relation
            </v-card-title>
            <v-card-text>
              <v-text-field solo label="Relation name ..." dense hide-details v-model="newCreation">
              </v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text color="blue" @click="createObject" :disabled="newCreation==''">
                Create
              </v-btn>
            </v-card-actions>
          </div>
          <div v-if="objectType==3">
            <v-card-title>
              Create statement
            </v-card-title>
            <v-card-text>
              <v-text-field solo label="Create name ..." dense hide-details v-model="newCreation">
              </v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text color="yellow" @click="createObject" :disabled="newCreation==''">
                Create
              </v-btn>
            </v-card-actions>
          </div>
          <div v-if="objectType==4">
            <v-card-title>
              Create condition
            </v-card-title>
            <v-card-text>
              <v-text-field solo label="Condition name ..." dense hide-details v-model="newCreation">
              </v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text color="purple" @click="createObject" :disabled="newCreation==''">
                Create
              </v-btn>
            </v-card-actions>
          </div>
          <div v-if="objectType==5">
            <v-card-title>
              Create action
            </v-card-title>
            <v-card-text>
              <v-text-field solo label="Action name ..." dense hide-details v-model="newCreation">
              </v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text color="orange" @click="createObject" :disabled="newCreation==''">
                Create
              </v-btn>
            </v-card-actions>
          </div>
        </v-card>
        <v-card width="50%" height="100%" flat class="pa-3 overflow-auto" v-if="selectedQuery.objectType == 'concept'">
          <div class="text-body-1" v-if="selectedQuery.data=='link'" style="height: calc(100% - 130px);">
            <div class="text-h5">Contents</div><br>
            <div class="d-flex align-center">
              <v-text-field v-model="selectedQuery.contents"></v-text-field>
            </div>
            <div class="iframe-container" v-if="typeof selectedQuery.contents == 'string'">
              <iframe
                :src="selectedQuery.contents"
                width="100%"
                height="100%"
                frameborder="0"
              ></iframe>
            </div>
          </div>
          <div v-if="selectedQuery.data=='file'" style="height: calc(100%);">
            <!--<TextEditor
              :concepts="concepts"
              :relations="relations"
              :categories="categories"
              :contents="selectedQuery"
              @addItem="addItem"
              @updateContents="updateContents"
            >
            </TextEditor>-->
          </div>
          <div v-if="selectedQuery.data=='image'">
            <div class="text-h5">Contents</div><br>
            <div class="d-flex align-center">
              <v-btn @click="setConceptImage" icon class="mr-3">
                <v-icon>
                  mdi-image
                </v-icon>
              </v-btn>
              <span class="text-body-1" v-if="typeof selectedQuery.contents == 'string'">
                {{ selectedQuery.contents.split('/').slice(-1)[0] }}
              </span>
            </div>
            <v-divider class="mb-4 mt-2"></v-divider>
            <div v-if="typeof selectedQuery.contents == 'string'" >
              <v-dialog v-model="fullImage" fullscreen hide-overlay>
                <template v-slot:activator="{ on, attrs }">
                  <v-img v-bind="attrs" v-on="on" @click="fullImage=true" :src="'safe-protocol://' + selectedQuery.contents"></v-img>
                </template>
                <div style="height: 100vh; width: 100h; background: #191919;" class="pa-5 d-flex align-center justify-center"  @click="fullImage=false">
                  <v-img :src="'safe-protocol://' + selectedQuery.contents" contain max-height="100%" max-width="100%"></v-img>
                </div>
              </v-dialog>
            </div>
          </div>
        </v-card>
      </div>
  </div>
</template>

<script>
  import EventBus from '@/event-bus'
  import colors from 'vuetify/lib/util/colors';
  import { marked } from 'marked';
  // eslint-disable-next-line
  import TextEditor from './TextEditor';

  export default {
    name: 'QueryView',

    data: () => ({
      selectedQuery: [],
      selectingArea: null,
      loading: false,
      select: null,

      dataTypes: ['file', 'image', 'link'],

      fullImage: false,
      newCreation: '',
    }),

    components: {
      // eslint-disable-next-line
      TextEditor
    },

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
      },
      objectType: {
        required: true,
      },
      contentType: {
        required: true,
      },
      sentences: {
        required: true,
      }
    },

    methods: {
      addItem(concept) {
        EventBus.$emit('addItem', concept)
      },
      updateContents(contents) {
        EventBus.$emit('updateContents', contents)
      },
      changeDataType() {
        this.selectedQuery.contents = []
        this.saveData()
      },
      async setConceptImage() {
        const message = await new Promise(resolve => {
          window.electronAPI.openFileBrowser('image')
          window.electronAPI.response('open-file-browser-response', resolve)
        });
        this.selectedQuery.contents = message
      },
      createObject() {
        EventBus.$emit('createObject', this.newCreation, this.objectType, this.contentType)
        this.newCreation = ''
      },
      saveData() {
        EventBus.$emit('saveData')
      },
      compiledMarkdown(md) {
        if (md) {
          return marked.parse(md);
        }
        return md
      },
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
        for(let i=0; i<this.categories.length; i++) {
          if (this.categories[i].id==id) {
            return this.categories[i]
          }
        }
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
        console.log(1)
        this.select = null
      },
      setQuery(object) {
        this.selectedQuery = object
      },
      deleteItem(item) {
        if (item.id == this.selectedQuery.id) {
          this.selectedQuery = []
        }
        EventBus.$emit('deleteItem', item)
      },
    },

    computed: {
      contentTypeIcon() {
        let icons = [
          'mdi-file',
          'mdi-image',
          'mdi-link',
        ]
        return icons[this.contentType]
      },
      objectTypeColor() {
        let colors = [
          'red',
          'green',
          'blue',
          'yellow',
          'purple',
          'orange'
        ]
        return colors[this.objectType]
      },
      objectTypeIcon() {
        let icons = [
          'mdi-pound',
          'mdi-code-brackets',
          'mdi-transit-connection-horizontal',
          'mdi-code-tags',
          'mdi-source-fork',
          'mdi-skew-more',
        ]
        return icons[this.objectType]
      },
      filtered: {
        get () {
          if (this.objectType==0) {
            return this.categories
          }
          else if (this.objectType==1) {
            if (this.contentType==0) {
              return this.concepts.filter((concept) => concept.data=='file')
            }
            if (this.contentType==1) {
              return this.concepts.filter((concept) => concept.data=='image') 
            }
            if (this.contentType==2) {
              return this.concepts.filter((concept) => concept.data=='link') 
            }
            else {
              return this.concepts
            }
          }
          else if (this.objectType==2) {
            return this.relations
          }
          else if (this.objectType==3) {
            return this.statements
          }
          else if (this.objectType==4) {
            return this.conditions
          }
          else if (this.objectType==5) {
            return this.actions
          }
          else {
            return [...this.concepts, ...this.relations, ...this.categories, ...this.statements, ...this.conditions, ...this.actions]
          }
        }
      },
      objects() {
        return [...this.concepts, ...this.relations, ...this.categories, ...this.statements, ...this.conditions, ...this.actions]
      }
    },

    created() {
      EventBus.$on('setQuery', this.setQuery)
    },

  }
</script>

<style scoped>
  .iframe-container {
    height: 100%;
    width: 100%;
    width: calc(100% + 16px);
    transfrom: translateX(8px);
    position: relative;
  }
  .iframe-container:after {
    content: '';
    position: absolute;
    top: 0px;
    bottom: 0px;
    right: 0px;
    width: 16px;
    background: #1e1e1e;
  }
  #query {
    height: calc(100vh - 80px);
    width: 100h;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  #filter {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  #data {
    height: calc(100vh - 160px);
    display: flex;
    gap: 10px;
    justify-content: center;
    align-items: center;
  }
  table {
    border-collapse: collapse;
    width: 100%;
  }
  table, th, td {
    border: 1px solid #333;
    text-align: center;
    vertical-align: middle;
    padding: 8px;
  }
  .markdown > * {
    margin: 20px 0;
  }
</style>
