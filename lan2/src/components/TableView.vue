<template>
  <div>
    <div id="table" v-if="table">
      <br>
      <div class="mb-2 d-flex justify-space-around">
        <v-btn-toggle dense v-model="editMode" tile>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                dark
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>
                  mdi-plus
                </v-icon>
              </v-btn>
            </template>
            <span>1</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                dark
                v-bind="attrs"
                v-on="on"
                disabled
              >
                <v-icon>
                  mdi-table-split-cell
                </v-icon>
              </v-btn>
            </template>
            <span>2</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                dark
                v-bind="attrs"
                v-on="on"
                disabled
              >
                <v-icon>
                  mdi-table-merge-cells
                </v-icon>
              </v-btn>
            </template>
            <span>3</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="error"
                outlined
                dark
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>
                  mdi-pound
                </v-icon>
              </v-btn>
            </template>
            <span>Q</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="success"
                outlined
                dark
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>
                  mdi-code-brackets
                </v-icon>
              </v-btn>
            </template>
            <span>W</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                outlined
                color="primary"
                dark
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>
                  mdi-transit-connection-horizontal
                </v-icon>
              </v-btn>
            </template>
            <span>E</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                outlined
                color="yellow"
                dark
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>
                  mdi-function-variant
                </v-icon>
              </v-btn>
            </template>
            <span>R</span>
          </v-tooltip>
        </v-btn-toggle>
      </div>
      <br>
      <table>
        <tr v-for="(row, i) in table.matrix" :key="i">
          <td
          v-for="(cell, j) in row" 
          :key="j"
          @click="cellClick"
          @mouseleave="currentHover=null"
          @mousemove="cellMouseMove"
          :id="i+'-'+j"
          :class="cell.type">
            <span v-if="cell.type!='function'">{{ cell.data }}</span>
            <span v-else>{{ cell.data }}</span> 
          </td>
          <td class="result">
            <div :class="['result-inner', evaluation(row) ? 'true' : 'false']">
            </div>
          </td>
        </tr>
      </table>
    </div>
    <div class="notFile" v-else>
      <v-icon x-large>
        mdi-folder-outline
      </v-icon>
    </div>
  </div>
</template>

<script>
  // eslint-disable-next-line
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

  import { Cell } from '@/classes/classes.js';
  import EventBus from '@/event-bus'
  // eslint-disable-next-line
  import Vue from 'vue'

  export default {
    name: 'QueryView',

    data: () => ({
      editMode: null,
      currentHover: null,
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
      table: {
        required: true,
      },
      sentences: {
        required: true,
      }
    },

    methods: {
      switchFunctionType(cell, i, j) {
        let functionTypes = ['and', 'or', 'not', 'exists', 'for all']
        if (!functionTypes.includes(cell.data)) {
          EventBus.$emit('updateMatrixCellData', i, j, 'and')
        }
        else {
          let index = (functionTypes.indexOf(cell.data)+1)%6
          EventBus.$emit('updateMatrixCellData', i, j, functionTypes[index])
        }
      },
      async updateMatrix() {
        if (this.table) {
          const message = await new Promise(resolve => {
            window.electronAPI.requestFileData(this.table.path)
            window.electronAPI.response('file-data-response', resolve)
          });

          if (typeof message === 'string') {
            let contents = message.split('\n')
            EventBus.$emit('updateMatrixContents', contents)
          }

          if (this.table.matrix.length > this.table.contents.length) {
            EventBus.$emit('spliceMatrix', this.table.contents.length)
            
            for (let i=0; i<this.table.contents.length; i++) {
              console.log(this.table.contents[i])
              let words = this.table.contents[i].split(' ')
              console.log(words)
              if (this.table.matrix[i].length > words.length) {
                EventBus.$emit('spliceMatrixRow', i, words.length)

                for (let j=0; j<words.length; j++) {
                  EventBus.$emit('updateMatrixCellData', i, j, words[j])
                }
              }
              else {
                for (let j=0; j<this.table.matrix[i].length; j++) {
                  EventBus.$emit('updateMatrixCellData', i, j, words[j])
                }
                for (let j=this.table.matrix[i].length; j<words.length ;j++) {
                  let newCell = new Cell()
                  newCell.data = words[j]
                  EventBus.$emit('newMatrixCell', i, newCell)
                }
              }
            }
          }
          else {
            for (let i=0; i<this.table.matrix.length; i++) {
              let words = this.table.contents[i].split(' ')
              if (this.table.matrix[i].length > words.length) {
                EventBus.$emit('spliceMatrixRow', i, words.length)
                for (let j=0; j<words.length; j++) {
                  EventBus.$emit('updateMatrixCellData', i, j, words[j])
                }
              }
              else {
                for (let j=0; j<this.table.matrix[i].length; j++) {
                  EventBus.$emit('updateMatrixCellData', i, j, words[j])
                }
                for (let j=this.table.matrix[i].length; j<words.length ;j++) {
                  let newCell = new Cell()
                  newCell.data = words[j]
                  EventBus.$emit('newMatrixCell', i, newCell)
                }
              }
            }
            for (let i=this.table.matrix.length; i<this.table.contents.length; i++) {
              let newRow = []
              let words = this.table.contents[i].split(' ')
              for (let j=0; j<words.length; j++) {
                let newCell = new Cell()
                newCell.data = words[j]
                newRow.push(newCell)
              }
              EventBus.$emit('newMatrixRow', newRow)
            }
          }
          for (let row = 0; row<this.table.matrix.length; row++) {
            for (let col = 0; col<this.table.matrix[row].length; col++) {
              let cell = this.table.matrix[row][col]
              let category = this.categories.filter(category => category.name==cell.data)
              let concept = this.concepts.filter(concept => concept.name==cell.data)
              let relation = this.relations.filter(relation => relation.name==cell.data)

              if (category.length && cell.type!='category') {
                EventBus.$emit('setCellType', row, col, 'category')
              }
              else if (concept.length && cell.type!='concept') {
                EventBus.$emit('setCellType', row, col, 'concept')
              }
              else if (relation.length && cell.type!='relation') {
                EventBus.$emit('setCellType', row, col, 'relation')
              }
              else if (category.length+concept.length+relation.length==0) {
                EventBus.$emit('setCellType', row, col, null)
              }
            }
          }
        }
      },
      addCommand(event) {

        if (event.key == 'q') {
          this.editMode = 3
        }
        else if (event.key == 'w') {
          this.editMode = 4
        }
        else if (event.key == 'e') {
          this.editMode = 5
        }
        else if (event.key == 'r') {
          this.editMode = 6
        }
        else if (parseInt(event.key) && parseInt(event.key) <= 3) {
          this.editMode = parseInt(event.key)-1
        }
      },
      cellClick(event) {
        let dimensions = event.target.getBoundingClientRect()
        if (event.offsetX<5 || event.offsetX>(dimensions.width-5)) {
          const row = parseInt(event.target.id.split('-')[0])
          let col = parseInt(event.target.id.split('-')[1])

          switch(this.editMode) {
            case 0:
              if (event.offsetX<5) {
                EventBus.$emit('insertCellBefore', row, col)
              }
              else {
                EventBus.$emit('insertCellAfter', row, col)
              }
              break
            case 1:
              EventBus.$emit('splitCell', row, col)
              break
            case 2:
              EventBus.$emit('mergeCells', row, col)
              break
          }
        }
        else {
          const row = parseInt(event.target.id.split('-')[0])
          const col = parseInt(event.target.id.split('-')[1])

          switch (this.editMode) {
            case 3:
              EventBus.$emit('setCellType', row, col, 'category')
              break
            case 4:
              EventBus.$emit('setCellType', row, col, 'concept')
              break
            case 5:
              EventBus.$emit('setCellType', row, col, 'relation')
              break
            case 6:
              EventBus.$emit('setCellType', row, col, 'function')
              break
          }

          if (!this.editMode && this.table.matrix[row][col].type=='function') {
            this.switchFunctionType(this.table.matrix[row][col], row, col)
          }
        }
      },
      cellMouseMove(event) {
        this.currentHover = event.target
        let dimensions = event.target.getBoundingClientRect()
        if (event.offsetX<5 || event.offsetX>(dimensions.width-5)) {
          if (this.editMode == 0) {
            event.target.style.cursor = "cell"
          }
          else if (this.editMode == 1) {
            event.target.style.cursor = "col-resize"
          }
          else if (this.editMode == 2) {
            event.target.style.cursor = "ew-resize"
          }
          else if ([3,4,5,6].includes(this.editMode)) {
            event.target.style.cursor = "copy"
          }
        }
        else {
          event.target.style.cursor = "default"
        }
      }
    },

    computed: {
      evaluation() {
        // eslint-disable-next-line
        return (row) => {
          let sentence = []

          for (let i=0; i<row.length; i++) {
            let cell = row[i]
            if (cell.type == 'category') {
              let category = this.categories.filter(category => category.name==cell.data)
              if (category.length) {
                sentence.push(category[0].id)
              }
            }
            else if (cell.type == 'relation') {
              let relation = this.relations.filter(relation => relation.name==cell.data)
              if (relation.length) {
                sentence.push(relation[0].id)
              }
            }
            else if (cell.type == 'concept') {
              let concept = this.concepts.filter(concept => concept.name==cell.data)
              if (concept.length) {
                sentence.push(concept[0].id)
              }
            }
          }

          return this.sentences.some(arr => arr.every((val, i) => val === sentence[i]))
        }
      }
    },

    watch : {
      table() {
        this.updateMatrix()
      },
      editMode() {
        if (this.currentHover) {
          if (this.editMode == 0) {
            this.currentHover.style.cursor = "cell"
          }
          else if (this.editMode == 1) {
            this.currentHover.style.cursor = "col-resize"
          }
          else if (this.editMode == 2) {
            this.currentHover.style.cursor = "ew-resize"
          }
          else if ([3,4,5,6].includes(this.editMode)) {
            this.currentHover.style.cursor = "copy"
          }
        }
      }
    },
    mounted() {
      window.addEventListener('keydown', this.addCommand);
    },
    beforeDestroy() {
      window.removeEventListener('keydown', this.addCommand);
    },
    created() {
      EventBus.$on('updateMatrix', this.updateMatrix)
    }
  }
</script>

<style scoped>
  table {
    border-collapse: collapse;
    width: 100%;
    table-layout: fixed;
  }
  table, td {
    text-align: center;
    vertical-align: middle;
    padding: 5px;
  }
  tr {
    display: flex;
    height: 30px !important;
  }
  td:not(.result) {
    flex: 1;
    border: 1px solid #333;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px;
    padding-left: 10px;
    padding-right: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  td:not(:last-child) {
    border-right: none;
  }
  tr:not(:first-child) td {
    border-top: none;
  }

  #table {
    height: 100%;
    width: 100h;
    padding: 20px;
  }
  .notFile {
    height: calc(100vh - 40px - 30px - 20px);
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .category:after {
    background: var(--v-error-base);
    content: '';
    top: 0;
    right: 0;
    bottom: 0;
    left:0;
    position: absolute;
    opacity: .15;
  }
  .concept:after {
    background: var(--v-success-base);
    content: '';
    top: 0;
    right: 0;
    bottom: 0;
    left:0;
    position: absolute;
    opacity: .15;
  }
  .relation:after {
    background: var(--v-primary-base);
    content: '';
    top: 0;
    right: 0;
    bottom: 0;
    left:0;
    position: absolute;
    opacity: .15;
  }
  .function:after {
    background: orange;
    content: '';
    top: 0;
    right: 0;
    bottom: 0;
    left:0;
    position: absolute;
    opacity: .15;
  }

  .result {
    width: 30px !important;
    border-left: 1px solid #333;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .result-inner {
    height: 10px;
    width: 10px;
    border-radius: 50%;
  }
  .result-inner.false {
    background: var(--v-error-base);
  }
  .result-inner.true {
    background: var(--v-success-base);
  }
</style>
