<template>
  <v-container>
    <div id="table">
      <table>
        <tr v-for="(row, i) in contents" :key="i">
          <td v-for="(cell, j) in splitLine(row)" :key="j" @mouseup="split(row)">{{ cell }}</td>
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
      split(line) {
        let selection = window.getSelection();
        let range = selection.getRangeAt(0);
        let selectedText = range.toString();

        if (selectedText) {
          const startPosition = range.startOffset;
          const endPosition = startPosition + selectedText.length;

          line.divisions.push(startPosition)
          line.divisions.push(endPosition)
        }

        selection.removeAllRanges();
      },
      setQuery(object) {
        this.selectedQuery = object
      },
      deleteItem(item) {
        EventBus.$emit('deleteItem', item)
      },
      splitLine(line) {
        if (line.divisions.length === 0) {
          return [line.contents]
        }

        const result = [];
        let start = 0;

        for (const index of line.divisions) {
            if (start < index) {
                result.push(line.contents.slice(start, index));
            }
            start = index;
        }

        if (start < line.contents.length) {
            result.push(line.contents.slice(start));
        }

        return result;
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

      this.contents = this.lines
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
