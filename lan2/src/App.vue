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
      <v-navigation-drawer v-model="drawer" absolute left hide-overlay clipped app width="120">
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
        <div id="contents" v-if="loaded">
          <BoardView 
            v-if="showing=='board'" 
            :concepts="concepts"
            :relations="relations"
            :categories="categories"
            :selectingArea="selectingArea"
            />
          <QueryView 
            v-if="showing=='query'"
            :concepts="concepts"
            :relations="relations"
            :categories="categories"
            :statements="statements"
            :actions="actions"
            :conditions="conditions"
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

import EventBus from './event-bus.js';

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
  }),
  methods: {
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

  },
  watch: {
    showing: 'saveData',
    concepts: 'saveData',
    relations: 'saveData',
    categories: 'saveData',
    statements: 'saveData',
    conditions: 'saveData',
    actions: 'saveData'
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

    this.loaded = true;

    //Generic Events
    EventBus.$on('saveData', this.saveData)
    
    //BoardView Events
    EventBus.$on('openQuery', this.openQuery)
    EventBus.$on('addItem', this.addItem)
    EventBus.$on('addTag', this.addTag)

    //QueryView Events
    EventBus.$on('deleteItem', this.deleteItem)
  }
};
</script>

<style>
  ::-webkit-scrollbar {
    display: none;
  }
  #contents {
    display: flex;
    height: calc(100vh - 64px);
    width: 100h;
    flex-direction: column;
    align-items: center;
  }
  #board {
    flex: 1;
    height: calc(100vh - 80px);
    cursor: crosshair;
    position: relative;
    width: 100%;
    background-size: 3em 3em;
      background-image: radial-gradient(circle, red 1px, rgba(0, 0, 0, 0) 1px);
      background-repeat: repeat;
  }
  #functions {
    flex: 1;
    height: calc(100vh - 80px);
    cursor: crosshair;
    position: relative;
    width: 100%;
    background-size: 3em 3em;
      background-image: radial-gradient(circle, blue 1px, rgba(0, 0, 0, 0) 1px);
      background-repeat: repeat;
  }
  .concept-toolbar {
    position: absolute;
    top: -35px;
    display: flex;
    left: 50%;
    gap: 0px;
    transform: translateX(-50%);
    justify-content: center;
    align-items: center;
  }
  .relation-toolbar {
    position: absolute;
    top: -35px;
    display: flex;
    height: 20px;
    left: 50%;
    gap: 5px;
    transform: translateX(-50%);
  }
  .concept-info {
    position: absolute;
    bottom: -20px;
    display: flex;
    height: 20px;
    left: 50%;
    gap: 5px;
    transform: translateX(-50%);
  }
  .concept-info span {
    border-radius: 3px;
    border: 1px solid red;
  }
  .relation-info {
    position: absolute;
    bottom: -25px;
    display: flex;
    height: 20px;
    left: 50%;
    gap: 5px;
    transform: translateX(-50%);
  }
  .relation-info span {
    border-radius: 3px;
    border: 1px solid red;
  }
  .addTag {
    outline: none;
    border-color: red !important;
    border-radius: 5px;
    min-width: 30px;
    width: 60px;
    height: 26px;
    padding-left: 3px;
    padding-right: 3px;
    color: white;
    background: #191919;
  }
  .concept {
    position: absolute;
    border-radius: 5px;
    padding: 5px;
    cursor: grab;
    transform: translate(-50%, -50%);
  }
  .concept-inner {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 3px;
  }
  .concept input {
    outline: none;
    border: 1px solid green;
    border-radius: 5px;
    min-width: 30px;
    width: 60px;
    padding-left: 3px;
    padding-right: 3px;
    color: white;
    /*background: #191919;*/
  }
  .relation {
    position: absolute;
    min-width: 30px;
    transform: translate(-50%, -50%);
  }
  .relation input {
    outline: none;
    border: 1px solid blue;
    border-radius: 5px;
    min-width: 30px;
    width: 60px;
    padding-left: 3px;
    padding-right: 3px;
    color: white;
    background: #191919;
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
    transform: translate(-50%, -50%);
    justify-content: center;
    align-items: center;
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
    top: 0px;
    left: 0px;
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
    border: 1px solid green !important;
  }
  .statement-tag {
    border: 1px solid red !important;
  }
  .statement-relation {
    border: 1px solid blue !important;
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

</style>