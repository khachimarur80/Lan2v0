<template>
  <v-app>
      <v-app-bar elevation="0" color="secondary" app clipped-left style="-webkit-app-region: drag; background: #121212 !important">
        <v-app-bar-nav-icon>
            <v-btn icon @click.stop="drawer = !drawer">
                <v-icon>
                    mdi-menu
                </v-icon>
            </v-btn>
        </v-app-bar-nav-icon>
        <v-spacer></v-spacer>
        <v-btn @click="showing='board'" color="error" outlined class="ml-2 mr-2">
          Board
        </v-btn>
        <v-btn @click="showing='query'" color="success" outlined class="ml-2 mr-2">
          Query
        </v-btn>
        <v-btn @click="showing='functions'" color="primary" outlined class="ml-2 mr-2">
          Function
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn icon @click.stop="drawer = !drawer">
              <v-icon>
                  mdi-cog-outline
              </v-icon>
          </v-btn>
      </v-app-bar>
      <v-navigation-drawer v-model="drawer" absolute left hide-overlay clipped app width="100">
        <div style="width: 100%; height: 60px;"></div>
        <v-list>
          <v-list-item>
            <button @click="addAction">
              Action
            </button>
          </v-list-item>
          <v-list-item>
            <button @click="createStatement('[]')">
              []
            </button>
          </v-list-item>
          <v-list-item>
            <button @click="createStatement('#')">
              #
            </button>
          </v-list-item>
          <v-list-item>
            <button @click="createStatement('[]--[]')">
              []--[]
            </button>
          </v-list-item>
          <v-list-item>
            <button @click="createStatement('#--[]')">
              #--[]
            </button>
          </v-list-item>
          <v-list-item>
            <button @click="createStatement('#--#')">
              #--#
            </button>
          </v-list-item>
          <v-list-item>
            <button @click="selectingArea=true" v-if="!selectingArea">
              Area
            </button>
            <button @click="selectingArea=false" v-else>
              No Area
            </button>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-main>
        <div id="contents">
          <BoardView 
            v-if="showing=='board'" 
            :conceptsData="concepts"
            :relationsData="relations"
            :categoriesData="categories"
            :selectingAreaData="selectingArea"
            />
          <QueryView 
            v-if="showing=='query'"
            :conceptsData="concepts"
            :relationsData="relations"
            :categoriesData="categories"
          />
          <FunctionsView 
            v-if="showing=='functions'"
            :statementsData="statements"
            :actionsData="actions"
            :conditionsData="conditions"
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
    this.id = Math.floor(Math.random()*100000)
    this.condition = null
    this.name = ''

    //Board values
    this.x = 100
    this.y = 100
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
  }),
  methods: {
    addAction() {
      let action = new Action()
      action.x = 100
      action.y = 100

      this.actions.push(action)

      this.$nextTick(()=>{
      if (this.$refs.action) {
          this.$refs.action.forEach((actionElement) => {
            this.dragConcept(actionElement)
          })
        }
      })
    },
    openQuery(object) {
      this.showing = 'query'
      this.$nextTick(() => {
        EventBus.$emit('setQuery', object)
      })
    }
  },
  created() {
    EventBus.$on('openQuery', this.openQuery)
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
    outline: 1px solid #fff;
  }
  .condition-inner {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 3px;
    width: 70px;
    position: relative;
    flex-direction: column;
    gap: 5px;
  }
  .condition input {
    outline: none;
    border-radius: 5px;
    width: 70px;
    border: none;
    text-align: center;
  }
  .action {
    position: absolute;
    border-radius: 5px;
    padding: 5px;
    cursor: grab;
    transform: translate(-50%, -50%);
    outline: 1px solid #fff;
  }
  .action-inner {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 3px;
    width: 70px;
    position: relative;
    flex-direction: column;
    gap: 5px;
  }
  .action input {
    outline: none;
    border-radius: 5px;
    min-width: 30px;
    border: 1px solid #fff;
  }

  .statement {
    position: absolute;
    border-radius: 5px;
    padding: 5px;
    cursor: grab;
    transform: translate(-50%, -50%);
    outline: 1px solid #fff;
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
    min-width: 30px;
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
    top: 18px;
    right: -8px;
  }
  .condition-node {
    top: 0px;
    left: 44px;
  }
  .action-node {
    bottom: -8px;
    left: 44px;
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
    background: #fff;
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
</style>