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
              >
                <v-icon>
                  mdi-arrow-expand-horizontal
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
              >
                <v-icon>
                  mdi-arrow-expand-horizontal
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
          >{{ cell.data }}</td>
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
    },

    methods: {
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
        }
      },
      addCommand(event) {
        let previous = this.editMode

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

        if (previous == this.editMode) {
          this.editMode = null
        }
      },
      cellClick(event) {
        console.log(event.offsetX)
        let dimensions = event.target.getBoundingClientRect()
        if (event.offsetX<5 || event.offsetX>(dimensions.width-5)) {
          console.log('EDGE')
        }
        else {
          console.log('BODY')
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
  }
  td {
    flex: 1;
    border: 1px solid #333;
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
</style>
