<template>
  <v-app v-if="lan">
    <div id="titlebar" class="text-overline">
      <span>{{ lan.name }}</span><span class="mini-hr mx-1"></span> <span style="color: var(--v-error-base);">lan2</span>
    </div>
    <v-main>
      <div id="main">
        <div id="leftsidebar" :class="showFolderStructure ? '' : 'hideFolders' ">
          <div id="folderStructure" class="d-flex flex-column" style="flex: 1;">
            <div class="subtitle-2 px-2 py-2">
            Carpetas
            </div>
            <div id="treeview" class="mx-1">
            <TreeView :items="folderStructure" :vault="lan.name" v-if="folderStructure"></TreeView>
            </div>
          </div>
          <div id="menu" class="d-flex justify-start align-center pt-2 flex-column">
            <v-btn icon dense x-small @click="showFolderStructure=!showFolderStructure" :color="showFolderStructure ? 'error' : ''">
              <v-icon>
                mdi-folder-multiple-outline
              </v-icon>
            </v-btn>

            <v-divider style="width: 20px" class="my-1">
            </v-divider>

            <v-btn icon dense x-small class="mx-2" :color="lan.showing=='board' ? 'error' : ''" @click="setShowing('board')">
              <v-icon>
                mdi-source-fork
              </v-icon>
            </v-btn>
            <v-btn icon dense x-small class="mx-2" :color="lan.showing=='text' ? 'error' : ''" @click="setShowing('text')">
              <v-icon>
                mdi-text-recognition
              </v-icon>
            </v-btn>
            <v-btn icon dense x-small class="mx-2" :color="lan.showing=='query' ? 'error' : ''" @click="setShowing('query')">
              <v-icon>
                mdi-database-search
              </v-icon>
            </v-btn>
            <v-btn icon dense x-small class="mx-2" :color="lan.showing=='table' ? 'error' : ''" @click="setShowing('table')" disabled>
              <v-icon>
                mdi-table
              </v-icon>
            </v-btn>
            <v-btn icon dense x-small class="mx-2" :color="lan.showing=='function' ? 'error' : ''" @click="setShowing('function')" disabled>
              <v-icon>
                mdi-function-variant
              </v-icon>
            </v-btn>

            <v-divider style="width: 20px" class="my-1">
            </v-divider>

          </div>
        </div>
        <div id="contents" @wheel="zoomBoard">
          <BoardView 
            v-if="lan.showing=='board'" 
            :concepts="lan.concepts"
            :relations="lan.relations"
            :categories="lan.categories"
            :selectingArea="lan.selectingArea"
            :zoomVal="lan.zoomVal"
          />
          <TableView 
            v-if="lan.showing=='table'"
            :concepts="lan.concepts"
            :relations="lan.relations"
            :categories="lan.categories"
            :statements="lan.statements"
            :actions="lan.actions"
            :conditions="lan.conditions"
          />
          <TextView 
            v-if="lan.showing=='text'"
            :concepts="lan.concepts"
            :relations="lan.relations"
            :categories="lan.categories"
            :contents="lan.contents"
          />
          <QueryView 
            v-if="lan.showing=='query'"
            :concepts="lan.concepts"
            :relations="lan.relations"
            :categories="lan.categories"
            :statements="lan.statements"
            :actions="lan.actions"
            :conditions="lan.conditions"
            :objectType="lan.objectType"
            :contentType="lan.contentType"
          />
          <FunctionsView 
          v-if="lan.showing=='functions'"
          :concepts="lan.concepts"
          :relations="lan.relations"
          :categories="lan.categories"
          :statements="lan.statements"
          :actions="lan.actions"
          :conditions="lan.conditions"
          />
        </div>
        <div id="rightsidebar" class="pa-2 d-flex justify-center flex-column">
          <v-text-field>
          </v-text-field>
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script>

import TreeView from './../../components/TreeView';
import BoardView from './../../components/BoardView';
import QueryView from './../../components/QueryView';
import FunctionsView from './../../components/FunctionsView';
import TableView from './../../components/TableView';
import TextView from './../../components/TextView';


import EventBus from './../../event-bus.js';

class Lan {
  constructor(name, location) {
    this.name = name
    this.location = location
    this.showing =  'board'
    this.concepts =  []
    this.relations =  []
    this.categories =  []
    this.statements = []
    this.conditions =  []
    this.actions =  []
    this.selectingArea =  false
    this.drawer =  false
    this.loaded =  false
    this.contents =  []
    this.zoomVal =  1
    this.objectType =  null
    this.contentType =  null
  }
}

class Category {
  constructor(name) {
    this.objectType = 'category'
    this.name = name
    this.id = Math.floor(Math.random()*100000)
    this.objects = []
  }
}

class Concept {
  constructor() {
    this.objectType = 'concept'
    this.name = ''
    this.id = Math.floor(Math.random()*100000)
    this.data = 'file'
    this.contents = null

    //Board values
    this.x = 0
    this.y = 0

    //Attributes for easier parsing
    this.relations = []
    this.categories = []
  }
}

class Relation {
  constructor() {
    this.objectType = 'relation'
    this.name = ''
    this.id = Math.floor(Math.random()*100000)
    this.subject = null
    this.object = null
    this.offsetX1 = 0
    this.offsetX2 = 0
    this.offsetY1 = 0
    this.offsetY2 = 0

    //Attributes for easier parsing
    this.categories = []
  }
}

class Action {
  constructor() {
    this.objectType = 'action'
    this.id = Math.floor(Math.random()*100000)
    this.name = '#'+this.id.toString()
    this.condition = null

    //Board values
    this.x = 100
    this.y = 100

    this.offsetX = 0
    this.offsetY = 0
  }
}

class Condition {
  constructor() {
    this.objectType = 'condition'
    this.id = Math.floor(Math.random()*100000)
    this.name = '#'+this.id.toString()
    this.items = []

    //Board values
    this.x = 100
    this.y = 100

    this.statementOffsetX = 0
    this.statementOffsetY = 0

    this.actionOffsetX = 0
    this.actionOffsetY = 0
  }
}

class Statement {
  constructor(type) {
    this.objectType = 'statement'
    this.id = Math.floor(Math.random()*100000)
    this.name = '#'+this.id.toString()
    this.type = type
    this.items = []

    //Board values
    this.x = 100
    this.y = 100

    this.offsetX = 0
    this.offsetY = 0
  }
}

export default {
  name: 'App',

  components: {
    BoardView,
    QueryView,
    FunctionsView,
    TableView,
    TextView,
    TreeView,
  },

  data: () => ({
    //Left Sidebar Variables
    folderStructure: null,
    showFolderStructure: false,

    lan: null,
  }),
  methods: {
    async updateFolderStructure() {
      const folderStructure = await new Promise(resolve => {
        window.electronAPI.getFolderStructure()
        window.electronAPI.response('get-folder-structure-response', resolve)
      })

      this.folderStructure = folderStructure
    },

    //Left Sidebar Methods
    // ------------------------------------------ TREEVIEW ------------------------------------------- //
        
    //Open a directory
    openNode(node) {
        node.open = !node.open
    },
    //Save new name for a node
    saveFileNode(node, new_name) {
        var short_name = new_name.split('/').splice(-1)[0].split('.').slice(0,-1).join(".")
        if (this.file==node.id) {
            this.file = new_name
        }
        for (let i=0; i<this.files.length; i++) {
            if (this.files[i][0]==node.id) {
                this.files[i] = [new_name, short_name]
            }
        }
    },
    //Change location of a node
    moveFile(origin, destiny) {
        window.electronAPI.moveFileRequest(origin, destiny)
        setTimeout(()=>{this.updateFolderStructure()}, 100)
    },

    openFile(file) {
      console.log(file)
    },

    setShowing(showing) {
      if (this.lan.showing==showing) {
        this.lan.showing = ''
      }
      else {
        this.lan.showing = showing
      }
      this.saveData()
    },

    setContentType(index) {
      if (this.lan.contentType!=index) {
        this.lan.contentType = index;
      }
      else {
        this.lan.contentType = null
      }
      EventBus.$emit('setQuery', [])
    },
    setObjectType(index) {
      if (this.objectType!=index) {
        this.objectType = index;
      }
      else {
        this.objectType = null
      }
      EventBus.$emit('setQuery', [])
    },
    zoomBoard(event) {
      if (this.lan.showing=='board') {
        this.lan.zoomVal += event.deltaY*0.0005
        this.lan.zoomVal = Math.max(Math.min(10, this.lan.zoomVal), .1)

        //document.getElementById('board').style.transform = `scale(${this.lan.zoomVal})`
      }
    },
    createStatement(type) {
      let statement = new Statement(type)
      statement.x = Math.floor(Math.random()*100) + 150
      statement.y = Math.floor(Math.random()*100) + 150

      if (type=='[]') {
        statement.items = [['concept', '']]
      }
      if (type=='#') {
        statement.items = [['tag', '']]
      }
      if (type=='[]--[]') {
        statement.items = [['concept', ''],['relation', ''],['concept', '']]
      }
      if (type=='#--[]') {
        statement.items = [['tag', ''],['relation', ''],['concept', '']]
      }
      if (type=='#--#') {
        statement.items = [['tag', ''],['relation', ''],['tag', '']]
      }

      this.statements.push(statement)

      EventBus.$emit('updateStatementsDrag')
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
    addAction() {
      let action = new Action()
      action.x = Math.floor(Math.random()*100) + 150
      action.y = Math.floor(Math.random()*100) + 150

      this.actions.push(action)

      EventBus.$emit('updateActionsDrag')
    },
    addClause() {
      let condition = new Condition()
      condition.x = Math.floor(Math.random()*100) + 150
      condition.y = Math.floor(Math.random()*100) + 150

      this.conditions.push(condition)

      EventBus.$emit('updateConditionsDrag')
    },
    openQuery(object) {
      this.lan.showing = 'query'
      this.$nextTick(() => {
        EventBus.$emit('setQuery', object)
      })
    },
    saveData() {
      const data = this.lan
      console.log(data)
      //window.electronAPI.saveData(data)
    },
    addItem(item) {
      if (item.objectType == 'category') {
        this.lan.categories.push(item)
      }
      else if (item.objectType == 'relation') {
        this.lan.relations.push(item)
      }
      else if (item.objectType == 'statement') {
        this.lan.statements.push(item)
      }
      else if (item.objectType == 'condition') {
        this.lan.conditions.push(item)
      }
      else if (item.objectType == 'action') {
        this.lan.actions.push(item)
      }
      else {
        this.lan.concepts.push(item)
      }
    },
    addTag(target, tag) {
      tag.objects.push(target.id)
      target.categories.push(tag.id)
    },
    deleteItem(item) {
      if (item.objectType == 'category') {
        this.lan.categories = this.lan.categories.filter(category => category.id !== item.id);
      }
      else if (item.objectType == 'relation') {
        this.lan.relations = this.lan.relations.filter(relation => relation.id !== item.id);
      }
      else if (item.objectType == 'statement') {
        this.lan.statements = this.lan.statements.filter(statement => statement.id !== item.id);
      }
      else if (item.objectType == 'condition') {
        this.lan.conditions = this.lan.conditions.filter(condition => condition.id !== item.id);
      }
      else if (item.objectType == 'action') {
        this.lan.actions = this.lan.actions.filter(action => action.id !== item.id);
      }
      else {
        this.lan.concepts = this.lan.concepts.filter(concept => concept.id !== item.id);
      }
    },
    updateContents(contents) {
      this.lan.contents = contents
      this.saveData()
    },
    createObject(name, object, content) {
      if (object==0) {
        let category = new Category()
        category.name = name
        this.lan.categories.push(category)

        EventBus.$emit('setQuery', category)
      }
      else if (object==1) {
        if (content==1) {
          let concept = new Concept()
          concept.name = name
          this.lan.concepts.push(concept)

          EventBus.$emit('setQuery', concept)
        }
        else if (content==2) {
          let concept = new Concept()
          concept.name = name
          this.lan.concepts.push(concept)

          EventBus.$emit('setQuery', concept)
        }
        else {
          let concept = new Concept()
          concept.name = name
          this.lan.concepts.push(concept)

          EventBus.$emit('setQuery', concept)
        }
      }
      else if (object==2) {
        let relation = new Relation()
        relation.name = name
        this.lan.relations.push(relation)

        EventBus.$emit('setQuery', relation)
      }
      else if (object==3) {
        let statement = new Statement()
        statement.name = name
        this.lan.statements.push(statement)

        EventBus.$emit('setQuery', statement)
      }
      else if (object==4) {
        let condition = new Condition()
        condition.name = name
        this.lan.conditions.push(condition)

        EventBus.$emit('setQuery', condition)
      }
      else if (object==5) {
        let action = new Action ()
        action.name = name
        this.lan.actions.push(action)

        EventBus.$emit('setQuery', action)
      }
    }
  },
  watch: {
    showing: 'saveData',
    concepts: 'saveData',
    relations: 'saveData',
    categories: 'saveData',
    statements: 'saveData',
    conditions: 'saveData',
    actions: 'saveData',
    objectType: 'saveData',
    contentType: 'saveData',
  },
  async created() {
    //SideBar.vue methods
    /*EventBus.$on('createFile', this.createFile);
    EventBus.$on('createFolder', this.createFolder);
    EventBus.$on('toggleTreeview', this.toggleTreeview);
    EventBus.$on('removeNodeFile', this.removeNodeFile);*/
        //TreeView.vue methods
        EventBus.$on('openNode', this.openNode);
        EventBus.$on('saveFileNode', this.saveFileNode)
        EventBus.$on('fileopened', this.openFile);
        EventBus.$on('filemove', this.moveFile);

    const data = await new Promise(resolve => {
      window.electronAPI.getData()
      window.electronAPI.response('get-data-response', resolve)
    })

    let lan = new Lan(data.name, data.location)

    for (const key in lan) {
      lan[key] = data[key];
    }

    this.lan = lan
    this.loaded = true;

    const folderStructure = await new Promise(resolve => {
      window.electronAPI.getFolderStructure()
      window.electronAPI.response('get-folder-structure-response', resolve)
    })

    this.folderStructure = folderStructure

    //Generic Events
    EventBus.$on('saveData', this.saveData)
    
    //BoardView Events
    EventBus.$on('openQuery', this.openQuery)
    EventBus.$on('addItem', this.addItem)
    EventBus.$on('addTag', this.addTag)

    //QueryView Events
    EventBus.$on('deleteItem', this.deleteItem)
    EventBus.$on('createObject', this.createObject)

    //TextView Events
    EventBus.$on('updateContents', this.updateContents)
  }
};
</script>

<style>
  #titlebar {
    border-bottom: 1px solid #ccc;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
    -webkit-app-region: drag;
  }
  ::-webkit-scrollbar {
    display: none;
  }
  .mini-hr {
    height: 2px;
    width: 8px;
    background: var(--v-error-base);
  }

  #main {
    display: flex;
    height: calc(100vh - 30px);
    width: 100h;
    overflow: hidden;
  }
  #leftsidebar {
    background: #f6f6f6;
    height: 100%;
    width: 200px;
    display: flex;
    transition: transform .2s ease-in-out;
  }
  #leftsidebar.hideFolders {
    transform: translateX(-170px);
    flex-direction: row-reverse;
  }
  #leftsidebar.hideFolders #folderStructure {
    display: none !important;
  }

  #menu {
    width: 30px;
    height: 100%;
    border-left: 1px solid #eee;
    border-right: 1px solid #eee;
    gap: 5px;
  }
  #treeview {
    height: calc(100% - 38px);
    overflow: auto;
  }
  #treeview::-webkit-scrollbar {
    width: 5px;
    height: 0;
  }
  #treeview::-webkit-scrollbar-track {
    background: rgba(255, 0, 0, .1);
  }
  #treeview::-webkit-scrollbar-thumb {
    background-color: var(--v-error-base);
    border-radius: 10px;
  }
  #contents {
    height: 100%;
    flex: 1;
    overflow: hidden;
    position: relative;
  }
  #rightsidebar {
    background: #f6f6f6;
    height: 100%;
    width: 200px;
    border-left: 1px solid #eee;
  }

  .inline-concept {
    color: var(--v-success-base) !important;
    cursor: pointer;
  }
  .highlight-concept {
    text-decoration-color: var(--v-primary-base) !important;
    text-decoration : underline;
  }

  /*
  ::-webkit-scrollbar {
    display: none;
  }
  line {
    stroke-width: 3px !important;
    stroke: var(--v-primary-base);
  }
  #contents {
    display: flex;
    height: calc(100vh - 64px);
    width: 100h;
    flex-direction: column;
    align-items: center;
    overflow: hidden;
  }
  #board {
    flex: 1;
    height: calc(100vh - 80px);
    cursor: crosshair;
    position: relative;
    width: 100%;
    top: 50%;
    left: 50%;
    transform-origin: top left;
  }
  #functions {
    flex: 1;
    height: calc(100vh - 80px);
    cursor: crosshair;
    position: relative;
    width: 100%;
  }
  .condition {
    position: absolute;
    border-radius: 5px;
    padding: 5px;
    cursor: grab;
    transform: translate(-50%, -50%);
    border: 1px solid purple;
    min-height: 26px;
    width: 80px;
    border-radius: 5px;
  }
  .condition-inner {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 3px;
    position: relative;
    flex-direction: column;
    gap: 10px;
  }
  .condition input {
    outline: none;
    border-radius: 5px;
    width: 60px;
    height: 26px;
    border: 1px solid purple;
    text-align: center;
    color: white;
    margin-left: 50%;
    transform: translateX(-50%);
  }
  .action {
    position: absolute;
    border-radius: 5px;
    padding: 5px;
    cursor: grab;
    transform: translate(-50%, -50%);
    border: 1px solid orange;
    min-height: 26px;
    border-radius: 5px;
  }
  .action-inner {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 3px;
    position: relative;
    flex-direction: column;
    gap: 5px;
  }
  .action input {
    outline: none;
    border-radius: 5px;
    width: 80px;
    height: 26px;
    border: 1px solid orange;
    text-align: center;
    color: white;
  }

  .statement {
    position: absolute;
    border-radius: 5px;
    padding: 5px;
    cursor: grab;
    transform: translate(-50%, -50%);
    border: 1px solid yellow;
  }
  .statement-inner {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 3px;
    gap: 10px;
    position: relative;
  }
  .statement input {
    outline: none;
    border-radius: 5px;
    min-width: 60px;
    background: #191919;
    color: white;
    padding-left: 5px;
  }

  .statement-inner::before {
    content: "";
    width: 80%;
    height: 1px;
    position: absolute;
    background: #fff;
    z-index: -1;
  }

  .node {
    height: 8px;
    width: 8px;
    border-radius: 50%;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .node.center {
    top: 50%;
    right: 50%;
    transform: translate(50%, -50%);
  }
  .node.left {
    top: 50%;
    transform: translate(50%, -50%);
    left: 0px;
  }
  .node.right {
    top: 50%;
    transform: translate(-50%, -50%);
    right: 0px;
  }
  .node.up {
    top: 0px;
    left: 50%;
    transform: translate(-50%, 50%);
  }
  .node.down {
    bottom: 0px;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .statement-node {
    top: 50%;
    transform: translate(-50%, -50%);
    right: -8px;
    background: yellow;
    cursor: pointer;
  }
  .statement-node .node-inner {
    background: black;
  }
  .condition-node {
    top: 50%;
    transform: translate(50%, -50%);
    left: -9px;
    background: yellow;
    cursor: pointer;
  }
  .condition-node .node-inner {
    background: black;
  }
  .condition .action-node {
    top: 50%;
    transform: translate(-50%, -50%);
    right: -8px;
    background: orange;
    cursor: pointer;
  }
  .condition .action-node .node-inner {
    background: black;
  }
  .action .action-node {
    top: 50%;
    transform: translate(50%, -50%);
    left: -9px;
    background: orange;
    cursor: pointer;
  }
  .action .action-node .node-inner {
    background: black;
  }

  .node:hover {
    background: #fff;
    cursor: pointer;
  }
  .node:hover .node-inner {
    background: black;
  }
  .node-inner {
    height: 6px;
    width: 6px;
    border-radius: 50%;
  }
  .relation-node .node-inner {
    background: #ccc;
  }
  #generalSVG {
    position: absolute;
    top: -50%;
    left: -50%;
    overflow: visible;
  }
  #generalFunctionsSVG {
    position: absolute;
    top: 0px;
    left: 0px;
  }
  .rectangle {
    background: rgba(255,0,0,.1);
    outline: 1px dotted red;
    position: absolute;
  }

  .statement-concept {
    border: 1px solid var(--v-success-base) !important;
  }
  .statement-tag {
    border: 1px solid var(--v-error-base) !important;
  }
  .statement-relation {
    border: 1px solid var(--v-primary-base) !important;
  }
  .true {
    box-shadow: 0px 0px 5px 2px hsl(114, 100%, 50%);
  }
  .false {
    box-shadow: 0px 0px 5px 2px hsl(0, 100%, 50%);
  }
  .inline-concept {
    color: var(--v-success-base);
    cursor: pointer;
  }
  .highlight-concept {
    text-decoration-color: var(--v-primary-base) !important;
    text-decoration : underline;
  }
  */
</style>