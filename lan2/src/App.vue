<template>
  <v-app>
      <v-app-bar outlined app clipped-left style="-webkit-app-region: drag;" elevation="0">
        <v-app-bar-nav-icon>
            <v-btn icon @click.stop="drawer = !drawer">
                <v-icon>
                    mdi-menu
                </v-icon>
            </v-btn>
        </v-app-bar-nav-icon>
        <v-spacer></v-spacer>
        <v-btn @click="showing='board'" outlined color="error" class="ml-2 mr-2">
          Board
        </v-btn>
        <!--<v-btn @click="showing='mermaid'" outlined color="pink lighten-1" class="ml-2 mr-2">
          Mermaid
        </v-btn>-->
        <!--<v-btn @click="showing='table'" outlined color="amber" class="ml-2 mr-2">
          Table
        </v-btn>-->
        <v-btn @click="showing='text'" outlined color="white" class="ml-2 mr-2">
          Text
        </v-btn>
        <v-btn @click="showing='query'" outlined color="success" class="ml-2 mr-2">
          Query
        </v-btn>
        <v-btn @click="showing='functions'" outlined color="primary" class="ml-2 mr-2">
          Function
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn icon @click.stop="drawer = !drawer">
              <v-icon>
                  mdi-cog-outline
              </v-icon>
          </v-btn>
      </v-app-bar>
      <v-navigation-drawer v-model="drawer" absolute left hide-overlay clipped app width="240" persistent>
        <div style="width: 100%; height: 60px;"></div>
        <v-list v-if="showing=='board'" class="d-flex align-center flex-column">
          <v-list-item>
            <v-btn @click="selectingArea=true" width="100" v-if="!selectingArea">
              <v-icon>
                mdi-select
              </v-icon>
            </v-btn>
            <v-btn @click="selectingArea=false" width="100" v-else>
              <v-icon>
                mdi-hand-back-right-outline
              </v-icon>
            </v-btn>
          </v-list-item>
          <v-list-item>
            <v-btn width="100">
              <v-icon>
                mdi-arrange-send-to-back
              </v-icon>
            </v-btn>
          </v-list-item>
        </v-list>
        <v-list v-if="showing=='query'" class="d-flex align-center flex-column">
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
            <v-btn icon @click="setObjectType(0)" tile :outlined="objectType === 0" color="red">
              <v-icon>mdi-pound</v-icon>
            </v-btn>

            <v-btn icon @click="setObjectType(1)" :outlined="objectType === 1" color="green" tile>
              <v-icon>mdi-code-brackets</v-icon>
            </v-btn>

            <v-btn icon @click="setObjectType(2)" :outlined="objectType === 2" tile color="blue">
              <v-icon>mdi-transit-connection-horizontal</v-icon>
            </v-btn>

            <v-btn icon @click="setObjectType(3)" :outlined="objectType === 3" tile color="yellow">
              <v-icon>mdi-code-tags</v-icon>
            </v-btn>

            <v-btn icon @click="setObjectType(4)" :outlined="objectType === 4" tile color="purple">
              <v-icon>mdi-source-fork</v-icon>
            </v-btn>

            <v-btn icon @click="setObjectType(5)" :outlined="objectType === 5" tile color="orange">
              <v-icon>mdi-skew-more</v-icon>
            </v-btn>
          </div>
          <div class="d-flex align-center justify-center mt-3" v-if="objectType==1">
            <v-btn icon @click="setContentType(0)" tile :outlined="contentType === 0">
              <v-icon>mdi-file</v-icon>
            </v-btn>

            <v-btn icon @click="setContentType(1)" :outlined="contentType === 1" tile>
              <v-icon>mdi-image</v-icon>
            </v-btn>

            <v-btn icon @click="setContentType(2)" :outlined="contentType === 2" tile>
              <v-icon>mdi-link</v-icon>
            </v-btn>
          </div>
        </v-list>
        <v-list v-if="showing=='functions'" class="d-flex align-center flex-column">
          <v-list-item>
            <v-btn @click="addAction" width="100" outlined color="orange">
              Action
            </v-btn>
          </v-list-item>
          <v-list-item>
            <v-btn @click="addClause" width="100" outlined color="purple">
              Clause
            </v-btn>
          </v-list-item>
          <v-list-item>
            <v-btn @click="createStatement('[]')" width="100" outlined color="yellow">
              <v-icon color="success">mdi-code-brackets</v-icon>
            </v-btn>
          </v-list-item>
          <v-list-item>
            <v-btn @click="createStatement('#')" width="100" outlined color="yellow">
              <v-icon color="error">mdi-pound</v-icon>
            </v-btn>
          </v-list-item>
          <v-list-item>
            <v-btn @click="createStatement('[]--[]')" width="100" outlined color="yellow">
              <v-icon color="success">mdi-code-brackets</v-icon>
              <v-icon color="primary">mdi-transit-connection-horizontal</v-icon>
              <v-icon color="success">mdi-code-brackets</v-icon>
            </v-btn>
          </v-list-item>
          <v-list-item>
            <v-btn @click="createStatement('#--[]')" width="100" outlined color="yellow">
              <v-icon color="error">mdi-pound</v-icon>
              <v-icon color="primary">mdi-transit-connection-horizontal</v-icon>
              <v-icon color="success">mdi-code-brackets</v-icon>
            </v-btn>
          </v-list-item>
          <v-list-item>
            <v-btn @click="createStatement('#--#')" width="100" outlined color="yellow">
              <v-icon color="error">mdi-pound</v-icon>
              <v-icon color="primary">mdi-transit-connection-horizontal</v-icon>
              <v-icon color="error">mdi-pound</v-icon>
            </v-btn>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-main>
        <div id="contents" v-if="loaded"  @wheel="zoomBoard">
          <BoardView 
            v-if="showing=='board'" 
            :concepts="concepts"
            :relations="relations"
            :categories="categories"
            :selectingArea="selectingArea"
          />
          <MermaidView 
            v-if="showing=='mermaid'"
            :concepts="concepts"
            :relations="relations"
            :categories="categories"
            :statements="statements"
            :actions="actions"
            :conditions="conditions"
          />
          <TableView 
            v-if="showing=='table'"
            :concepts="concepts"
            :relations="relations"
            :categories="categories"
            :statements="statements"
            :actions="actions"
            :conditions="conditions"
          />
          <TextView 
            v-if="showing=='text'"
            :concepts="concepts"
            :relations="relations"
            :categories="categories"
            :contents="contents"
          />
          <QueryView 
            v-if="showing=='query'"
            :concepts="concepts"
            :relations="relations"
            :categories="categories"
            :statements="statements"
            :actions="actions"
            :conditions="conditions"
            :objectType="objectType"
            :contentType="contentType"
          />
          <FunctionsView 
            v-if="showing=='functions'"
            :concepts="concepts"
            :relations="relations"
            :categories="categories"
            :statements="statements"
            :actions="actions"
            :conditions="conditions"
          />
        </div>
      </v-main>
  </v-app>
</template>

<script>
import BoardView from './components/BoardView';
import QueryView from './components/QueryView';
import FunctionsView from './components/FunctionsView';
import MermaidView from './components/MermaidView';
import TableView from './components/TableView';
import TextView from './components/TextView';

import EventBus from './event-bus.js';

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
    MermaidView,
    TableView,
    TextView,
  },

  data: () => ({
    showing: 'board',
    concepts: [],
    relations: [],
    categories: [],
    statements: [],
    conditions: [],
    actions: [],
    selectingArea: false,
    drawer: false,
    loaded: false,
    contents: [],
    zoomVal: 1,
    objectType: null,
    contentType: null,
  }),
  methods: {
    setContentType(index) {
      if (this.contentType!=index) {
        this.contentType = index;
      }
      else {
        this.contentType = null
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
      if (this.showing=='board') {
        this.zoomVal += event.deltaY*0.0001
        this.zoomVal = Math.max(Math.min(10, this.zoomVal), .1)
        document.getElementById('board').style.transform = `scale(${this.zoomVal})`
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
      this.showing = 'query'
      this.$nextTick(() => {
        EventBus.$emit('setQuery', object)
      })
    },
    saveData() {
      const data = {
        'showing' : this.showing,
        'concepts' : this.concepts,
        'relations' : this.relations,
        'categories' : this.categories,
        'statements' : this.statements,
        'conditions' : this.conditions,
        'actions' : this.actions,
        'contents' : this.contents,
        'objectType' : this.objectType,
        'contentType' : this.contentType,
      }
      window.electronAPI.saveData(data)
    },
    addItem(item) {
      if (item.objectType == 'category') {
        this.categories.push(item)
      }
      else if (item.objectType == 'relation') {
        this.relations.push(item)
      }
      else if (item.objectType == 'statement') {
        this.statements.push(item)
      }
      else if (item.objectType == 'condition') {
        this.conditions.push(item)
      }
      else if (item.objectType == 'action') {
        this.actions.push(item)
      }
      else {
        this.concepts.push(item)
      }
    },
    addTag(target, tag) {
      tag.objects.push(target.id)
      target.categories.push(tag.id)
    },
    deleteItem(item) {
      if (item.objectType == 'category') {
        this.categories = this.categories.filter(category => category.id !== item.id);
      }
      else if (item.objectType == 'relation') {
        this.relations = this.relations.filter(relation => relation.id !== item.id);
      }
      else if (item.objectType == 'statement') {
        this.statements = this.statements.filter(statement => statement.id !== item.id);
      }
      else if (item.objectType == 'condition') {
        this.conditions = this.conditions.filter(condition => condition.id !== item.id);
      }
      else if (item.objectType == 'action') {
        this.actions = this.actions.filter(action => action.id !== item.id);
      }
      else {
        this.concepts = this.concepts.filter(concept => concept.id !== item.id);
      }
    },
    updateContents(contents) {
      this.contents = contents
      this.saveData()
    },
    createObject(name, object, content) {
      if (object==0) {
        let category = new Category()
        category.name = name
        this.categories.push(category)

        EventBus.$emit('setQuery', category)
      }
      else if (object==1) {
        if (content==1) {
          let concept = new Concept()
          concept.name = name
          this.concepts.push(concept)

          EventBus.$emit('setQuery', concept)
        }
        else if (content==2) {
          let concept = new Concept()
          concept.name = name
          this.concepts.push(concept)

          EventBus.$emit('setQuery', concept)
        }
        else {
          let concept = new Concept()
          concept.name = name
          this.concepts.push(concept)

          EventBus.$emit('setQuery', concept)
        }
      }
      else if (object==2) {
        let relation = new Relation()
        relation.name = name
        this.relations.push(relation)

        EventBus.$emit('setQuery', relation)
      }
      else if (object==3) {
        let statement = new Statement()
        statement.name = name
        this.statements.push(statement)

        EventBus.$emit('setQuery', statement)
      }
      else if (object==4) {
        let condition = new Condition()
        condition.name = name
        this.conditions.push(condition)

        EventBus.$emit('setQuery', condition)
      }
      else if (object==5) {
        let action = new Action ()
        action.name = name
        this.actions.push(action)

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
    const message = await new Promise(resolve => {
      window.electronAPI.getData()
      window.electronAPI.response('get-data-response', resolve)
    })

    this.showing = message.showing || 'board';
    this.concepts = message.concepts || [];
    this.relations = message.relations || [];
    this.categories = message.categories || [];
    this.statements = message.statements || [];
    this.conditions = message.conditions || [];
    this.actions = message.actions || [];
    this.contents = message.contents || [];
    this.contentType = message.contentType;
    this.objectType = message.objectType;

    this.loaded = true;

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
</style>