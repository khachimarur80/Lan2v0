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
          let exists = false;
          for (let i=0; i<this.concepts.length; i++) {
            if (this.concepts[i].name.toLowerCase()==selectedText.toLowerCase()) {
              exists = true
              break
            }
          }
          if (!exists) {
            let concept = new Concept()
            concept.name = selectedText

            let n = this.concepts.length + 1
            let angle = 0
            let circle = 0

            while (n>0) {
              let dotsNum;
              if (circle==0) {
                dotsNum = 1
              }
              else {
                dotsNum = circle*5 + 1
              }
              if (n-dotsNum < 0) {
                angle = (2*Math.PI / (circle*4 + 1))*(dotsNum-n)
                n -= dotsNum
              }
              else if (n-dotsNum==0) {
                n -= dotsNum
              }
              else {
                n -= dotsNum
                circle += 1
              }
            }
            
            const rect = document.getElementById('table').getBoundingClientRect();

            concept.x = circle*80*Math.cos(angle) + rect.width/2
            concept.y = circle*80*Math.sin(angle) + rect.height/2

            EventBus.$emit('addItem', concept)
          }

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

      for (let i=0; i<this.concepts.length; i++) {
        for (let j=0; j<this.lines.length; j++) {
          let string = this.contents[j].contents
          let substring = this.concepts[i].name

          let startIndex = 0;

          while (startIndex !== -1) {
            startIndex = string.indexOf(substring, startIndex);

            if (startIndex !== -1) {
              const endIndex = startIndex + substring.length;
              this.contents[j].divisions.push(startIndex);
              this.contents[j].divisions.push(endIndex);
              startIndex++;
            }
          }
        }
      }
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
