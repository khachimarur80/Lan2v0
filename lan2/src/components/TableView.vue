<template>
  <v-container>
    <div id="table">
      <table>
        <tr v-for="(row, i) in contents" :key="i">
          <td v-for="(cell, j) in row" :key="j" @mouseup="split(i, j)">{{ cell }}</td>
        </tr>
      </table>
    </div>
  </v-container>
</template>

<script>
  import EventBus from '@/event-bus'
  // eslint-disable-next-line
  import Vue from 'vue'

  export default {
    name: 'QueryView',

    data: () => ({
      contents: [
      ]
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
      lines: {
          required: true,
      },
    },

    methods: {
      split(i, j) {
        let selection = window.getSelection();
        let range = selection.getRangeAt(0);
        let selectedText = range.toString();

        if (selectedText) {
          const startPosition = range.startOffset;
          const endPosition = startPosition + selectedText.length;

          let result = this.contents[i].slice(0,j).concat(Array.from([this.contents[i][j].slice(0, startPosition), this.contents[i][j].slice(startPosition, endPosition), this.contents[i][j].slice(endPosition)]), this.contents[i].slice(j+1,this.contents[i].length))
          result = result.filter(cell => !!cell)

          Vue.set(this.contents, i, result)
        }

        selection.removeAllRanges();
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

      this.contents = this.lines.map(line => line.contents)
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
    border: 1px solid #333;
  }
  tr {
    display: flex;
  }
  td {
    flex: 1;
  }
  #table {
    height: 100%;
    width: 100h;
    padding: 20px;
  }
</style>
