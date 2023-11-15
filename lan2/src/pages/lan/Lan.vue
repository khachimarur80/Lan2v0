<template>
  <v-app v-if="lan">
    <div id="titlebar" class="text-overline">
      <span>{{ fileName(file) }}</span><span class="mini-hr mx-1"></span> <span style="color: var(--v-error-base);">lan2</span>
    </div>
    <v-main>
      <div id="main">
        <div id="leftsidebar" :class="showFolderStructure ? '' : 'hideFolders' ">
          <div id="folderStructure" class="d-flex flex-column" style="flex: 1;">
            <div class="subtitle-2 px-2 py-2">
            Carpetas
            </div>
            <div id="treeview" class="mx-1">
            <TreeView :items="folderStructure" :vault="lan.location+'/'+lan.name" v-if="folderStructure"></TreeView>
            <div id="node-click-menu" v-if="clickMenu.opened" @blur="hideContextMenu"
              :style="{'top' : clickMenu.y + 'px', 'left' : clickMenu.x + 'px'}" tabindex="1">
              <div class="node-menu-item" @click="renameFile">
                  Rename
              </div>
              <div class="node-menu-item" @click="removeNodeFile">
                  Delete
              </div>    
          </div>
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
            <v-btn icon dense x-small class="mx-2" :color="lan.showing=='table' ? 'error' : ''" @click="setShowing('table')">
              <v-icon>
                mdi-table
              </v-icon>
            </v-btn>
            <!--<v-btn icon dense x-small class="mx-2" :color="lan.showing=='function' ? 'error' : ''" @click="setShowing('function')">
              <v-icon>
                mdi-function-variant
              </v-icon>
            </v-btn>-->

            <v-divider style="width: 20px" class="my-1">
            </v-divider>

            <v-spacer></v-spacer>
            <v-btn icon dense x-small class="mx-2 mb-2">
              <v-icon>
                mdi-cog-outline
              </v-icon>
            </v-btn>
          </div>
        </div>
        <div id="contents" @wheel="zoomBoard">
          <div id="tabs" class="px-2 py-1 d-flex">
            <v-btn small icon class="mr-2" @click="createFile">
              <v-icon>
                mdi-plus
              </v-icon>
            </v-btn>
            <div id="tabs-inner" class="d-flex" @wheel="scrollHorizontal">
              <div
                v-for="(tab, i) in tabs" 
                :key="i" 
                @click="openFile(tab)"
                :class="tab.active ? 'active-tab' : 'tab'"
                style="border-radius: 0px !important;"
                >
                {{ tab.name }}
                <v-btn @click="removeTab" x-small icon class="ml-1">
                  <v-icon>
                    mdi-close
                  </v-icon>
                </v-btn>
              </div>
            </div>
          </div>

          <div id="contents-inner">
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
              :table="getTable()"
            />
            <TextView 
              v-if="lan.showing=='text'"
              :concepts="lan.concepts"
              :relations="lan.relations"
              :categories="lan.categories"
              :file="activeTab"
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

import TreeView from '@/components/TreeView';
import BoardView from '@/components/BoardView';
import QueryView from '@/components/QueryView';
import FunctionsView from '@/components/FunctionsView';
import TableView from '@/components/TableView';
import TextView from '@/components/TextView';


import EventBus from '@/event-bus.js';

import {Statement, Action, Condition, Category, Concept, Relation, Lan, Tab, Line, Table} from '@/classes/classes.js';


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
    showFolderStructure: true,

    lan: null,
    tabs: [],
    file: null,

    clickMenu: {
      opened: false,
      x: 0,
      y: 0,
      node: null,
    },
  }),
  methods: {
    updateMatrixContents(contents) {
      let table = this.getTable()

      table.contents = contents

      this.saveData()
    },
    newMatrixRow(row) {
      let table = this.getTable()
      table.matrix.push(row)
      this.saveData()
    },
    newMatrixCell(i, cell) {
      let table = this.getTable()
      table.matrix[i].push(cell)

      this.saveData()
    },
    spliceMatrix(i) {
      let table = this.getTable()
      table.matrix.splice(i);

      this.saveData()
    },
    spliceMatrixRow(i, j) {
      let table = this.getTable()
      table.matrix[i].splice(j);

      this.saveData()
    },
    updateMatrixCellData(i, j, data) {
      let table = this.getTable()

      table.matrix[i][j].data = data

      this.saveData()
    },

    updateLine(lineIndex, newContents) {
      this.activeTab.contents[lineIndex].contents = newContents
      let table = this.getTable()

      if (table) {
        table.contents[lineIndex] = newContents
      }

      this.saveData()
    },
    removeLine(lineIndex) {
      this.activeTab.contents.splice(lineIndex, 1)
      let table = this.getTable()

      if (table) {
        table.contents.splice(lineIndex, 1)
      }

      this.saveData()
    },
    appendLine(lineIndex, newLine) {
      this.activeTab.contents.splice(lineIndex + 1, 0, newLine)

      let table = this.getTable()

      if (table) {
        table.contents.splice(lineIndex + 1, 0, newLine.contents)
      }

      this.saveData()
    },

    scrollHorizontal(event) {
      const scrollAmount = event.deltaY * 3;
      document.getElementById('tabs-inner').scrollLeft += scrollAmount;
      event.preventDefault();
    },
    removeTab(i) {
      this.tabs.splice(i, 1)
      this.file = this.lan.location + '/' + this.lan.name
      if (document.querySelector('.active-node')) {
        document.querySelector('.active-node').classList.remove('active-node')
      }
    },
    async createFile() {
      const message = await new Promise(resolve => {
          window.electronAPI.createFile(this.file)
          window.electronAPI.response('create-file-response', resolve)
      });

      this.openFile(message)

      this.updateFolderStructure()

      this.$nextTick(()=>{
        const tabsInner = document.getElementById('tabs-inner');
        tabsInner.scrollLeft = tabsInner.scrollWidth - tabsInner.clientWidth;
      })
    },
    async getLines(file) {
      const message = await new Promise(resolve => {
        window.electronAPI.requestFileData(file)
        window.electronAPI.response('file-data-response', resolve)
      });

      if (typeof message === 'string') {
        let contents = []

        let lines = message.split('\n')
        for (let i=0; i<lines.length; i++) {
          let line = new Line()
          line.contents = lines[i]
          contents.push(line)
        }

        return contents
      }

      return false
    },

    async getContents(file) {
      const message = await new Promise(resolve => {
        window.electronAPI.requestFileData(file)
        window.electronAPI.response('file-data-response', resolve)
      });

      let contents = message.split('\n')
      
      return contents
    },

    async openFile(file) {
      document.querySelectorAll('.active-node').forEach(obj => obj.classList.remove('active-node'))
      if (this.file != file) {
        this.file = file

        if (this.tabs.filter(obj => obj.active).length) {
          this.tabs.filter(obj => obj.active)[0].active = false
        }

        if (this.tabs.filter(obj => obj.path==this.file).length == 0) {

          let contents = await this.getLines(this.file)

          if (Array.isArray(contents)) {
            let newTab = new Tab()
            newTab.name = this.fileName(this.file)
            newTab.path = this.file
            newTab.active = true


            newTab.contents = contents
            this.tabs.push(newTab)
          }
        }
        else {
          this.tabs.filter(obj => obj.path==this.file)[0].active = true
        }

        this.$nextTick(()=>{
          const tabsInner = document.getElementById('tabs-inner');
          tabsInner.scrollLeft = tabsInner.scrollWidth - tabsInner.clientWidth;
        })

        if (document.getElementById(file)) {
          document.getElementById(file).classList.add('active-node')
        }
      }
      else {
        this.file = this.lan.location + '/' + this.lan.name
        if (document.querySelector('.active-node')) {
          document.querySelector('.active-node').classList.remove('active-node')
        }
        this.tabs = this.tabs.filter(tab => tab!=file)
      }
    },
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
        if (this.file==node.id) {
            this.file = new_name
        }
        for (let i=0; i<this.tabs.length; i++) {
            if (this.tabs[i].path==node.id) {
                this.tabs[i].path = new_name
                this.tabs[i].name = this.fileName(new_name)
            }
        }
    },
    //Change location of a node
    moveFile(origin, destiny) {
        window.electronAPI.moveFileRequest(origin, destiny)
        setTimeout(()=>{this.updateFolderStructure()}, 100)
    },

    setShowing(showing) {
      if (this.lan.showing==showing) {
        this.lan.showing = ''
      }
      else {
        this.lan.showing = showing
        if (showing == 'table') {
          EventBus.$emit('updateMatrix')
        }
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
      window.electronAPI.saveData(data)
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
      window.electronAPI.requestSaveFile(this.file, contents)

      let table = this.getTable()

      table.contents = contents.split('\n')

      this.saveData()
    },
    fileName(path) {
      if (path) {
        return path.split('/').slice(-1)[0]
      }
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
    },
    nodeMouseDown(event) {
      this.clickMenu.opened = true
      this.clickMenu.x = event.clientX
      this.clickMenu.y = event.clientY - 40
      this.clickMenu.node = event.target
    },
    //Make node contenteditable
    renameFile() {
        var target = this.clickMenu.node
        target.setAttribute('contenteditable', 'true')
        const range = document.createRange();
        range.selectNodeContents(target);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    },
    hideContextMenu() {
        this.clickMenu.opened = false
    },
    //Remove node
    removeNodeFile() {
      this.clickMenu.opened = false
      let target = this.clickMenu.node

      window.electronAPI.requestFileDeletion(target.id)
              
      if (this.file == target.id) {
          this.file = ''  
      }
      this.tabs = this.tabs.filter(file => file.path!=target.id)

      function removeNodeFromTree(tree, nodeId) {
          for (let i = 0; i < tree.length; i++) {
              const node = tree[i];

              if (node.id === nodeId) {
                tree.splice(i, 1);
                return true;
              }

              if (node.children) {
                if (removeNodeFromTree(node.children, nodeId)) {
                    return true;
                }
              }
          }

          return false;
      }
      removeNodeFromTree(this.folderStructure, target.id)
    },

    findNodeById(nodes, targetId) {
      for (const node of nodes) {
          if (node.id === targetId) {
              return node;
          }
          else if (node.children && node.children.length) {
              const foundNode = this.findNodeById(node.children, targetId);
              if (foundNode) {
                  return foundNode;
              }
          }
      }
      return null;
    },
    getTable() {
      if (!this.activeTab) {
        return false
      }
      else {
        let table = this.lan.tables.filter(table => table.path == this.file)

        if (table.length) {
          return table[0]
        }
        else {
          let newTable = new Table()
          newTable.path = this.file
          newTable.contents = this.activeTab.contents.map(obj => obj.contents)

          this.lan.tables.push(newTable)
          this.saveData()

          return newTable
        }
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

  computed : {
    activeTab() {
      if (this.tabs.filter(obj => obj.active)) {
        return this.tabs.filter(obj => obj.active)[0]
      }
      else {
        return false
      }
    },
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

    this.file = data.location+'/'+data.name
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
    EventBus.$on('updateLine', this.updateLine)
    EventBus.$on('appendLine', this.appendLine)
    EventBus.$on('removeLine', this.removeLine)

    //TreeView Events
    EventBus.$on('nodeMouseDown', this.nodeMouseDown)

    EventBus.$on('newMatrixCell', this.newMatrixCell)
    EventBus.$on('newMatrixRow', this.newMatrixRow)
    EventBus.$on('spliceMatrix', this.spliceMatrix)
    EventBus.$on('spliceMatrixRow', this.spliceMatrixRow)
    EventBus.$on('updateMatrixCellData', this.updateMatrixCellData)
    EventBus.$on('updateMatrixContents', this.updateMatrixContents)
  }
};
</script>

<style>
  #titlebar {
    background: #222;
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
    background: #161616;
    height: 100%;
    width: 200px;
    display: flex;
    justify-content: flex-end;
  }
  #leftsidebar.hideFolders {
    width: 30px;
    /*flex-direction: row-reverse;*/
  }
  #.hideFolders {
  }
  #menu {
    width: 30px;
    height: 100%;
    border-left: 1px solid #161616;
    border-right: 1px solid #161616;
    gap: 5px;
  }
  #treeview {
    height: 100%;
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
    width: calc(100% - 400px);
    overflow: hidden;
  }
  #leftsidebar.hideFolders ~ #contents {
    width: calc(100% - 230px);
  }
  #contents-inner {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  #rightsidebar {
    background: #161616;
    height: 100%;
    width: 200px;
    border-left: 1px solid #161616;
  }

  .inline-concept {
    color: var(--v-success-base) !important;
    cursor: pointer;
  }
  .highlight-concept {
    text-decoration-color: var(--v-primary-base) !important;
    text-decoration : underline;
  }
  #tabs {
    width: 100%;
    height: 40px;
    overflow: hidden;;
  }
  #tabs-inner {
    width: fit-content !important;
    overflow-x: scroll;
    gap: 10px;
    scroll-behavior: smooth;
    justify-content: center;
    align-items: flex-end;
  }
  .tab, .active-tab {
    width: fit-content !important;
    align-items: center;
    height: 30px;
    padding-left: 5px;
    padding-right: 5px;
    white-space: nowrap;
    display: inline-flex;
    user-select: none;
    cursor: default;
    border: 1px solid transparent;
  }
  .tab:hover {
    color: var(--v-error-base);
  }
  .active-tab {
    border-color: var(--v-error-base);
  }
  #node-click-menu {
    position: absolute;
    border: 1px solid rgb(87, 87, 87);
    width: fit-content;
    min-height: 48px;
    border-radius: 5px;
    z-index: 101;
    background: rgba(45, 45, 45);
    height: fit-content;
    padding: 3px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    outline: none;
  }
  .node-menu-item {
      font-size: 14px;
      min-width: 120px;
      display: flex;
      padding-left: 10px;
      color: #B9B9B9;
      justify-content: flex-start;
      align-items: center;
      border-radius: 3px;
  }
  .node-menu-item:hover {
      background: rgba(98, 141, 208, .7);
  }
</style>