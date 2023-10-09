<template>
  <div id="board" @mousedown="boardMouseDown" @mousemove="boardMouseMove" @mouseup="boardMouseUp">
    <svg id="generalSVG" height="100%" width="100%">
      <line 
        v-for="(relation, i) in relations" 
        :key="i" 
        :x1="relation.object.x+relation.offsetX1+'px'"
        :y1="relation.object.y+relation.offsetY1+'px'"
        :x2="relation.subject.x+relation.offsetX2+'px'"
        :y2="relation.subject.y+relation.offsetY2+'px'"
        width="1"
        stroke="white"
      >
      </line>
    </svg>
    <div v-if="rectangle" class="rectangle" :style="{ top: rectangle.top, left: rectangle.left, width: rectangle.width, height: rectangle.height, } "></div>
    <div class="concept" v-for="concept in concepts" :key="concept.id" :style="{ top : concept.y+'px', left : concept.x+'px'}" :data-id="concept.id" ref="concept" draggable="true">
      <div class="concept-toolbar" v-if="focusedItem==concept">
        <v-btn @click="addTagFlag=true" v-if="!addTagFlag" dense small icon>
          <v-icon>
            mdi-pound
          </v-icon>
        </v-btn>
        <div v-else class="d-flex">
          <v-btn @click="addTagFlag=false" dense small icon>
            <v-icon>
              mdi-close
            </v-icon>
          </v-btn>
          <input v-model="addingTag" class="addTag" @mousedown.stop autofocus @keydown.enter="addTag(concept)">
        </div>
        <v-btn dense small icon @click="openQuery(concept)">
          <v-icon>
            mdi-information
          </v-icon>
        </v-btn>
        <v-btn dense small icon>
          <v-icon>
            mdi-file
          </v-icon>
        </v-btn>
        <v-btn dense small icon>
          <v-icon>
            mdi-link
          </v-icon>
        </v-btn>
        <v-btn dense small icon>
          <v-icon>
            mdi-image
          </v-icon>
        </v-btn>
      </div>
      <div class="concept-inner">
        <input v-model="concept.name" @mousedown.stop @focus="focusItem(concept)">
      </div>
      <div class="concept-info">
        <span v-for="category in concept.categories" :key="category.id">{{ category.name }}</span>
      </div>
      <span class="node up" @mousedown.stop>
        <span class="node-inner" @click="createRelation">
        </span>
      </span>
      <span class="node down" @mousedown.stop>
        <span class="node-inner" @click="createRelation">
        </span>
      </span>
      <span class="node right" @mousedown.stop>
        <span class="node-inner" @click="createRelation">
        </span>
      </span>
      <span class="node left" @mousedown.stop>
        <span class="node-inner" @click="createRelation">
        </span>
      </span>
    </div>
    <div class="relation" v-for="relation in relations" :key="relation.id" :style="{ top : (relation.object.y+relation.subject.y)/2 + 'px', left : (relation.object.x+relation.subject.x)/2 + 'px' }" :data-id="relation.id">
      <div class="relation-toolbar" v-if="focusedItem==relation">
        <v-btn @click="addTagFlag=true" v-if="!addTagFlag" dense small icon>
          <v-icon>
            mdi-pound
          </v-icon>
        </v-btn>
        <div v-else class="d-flex">
          <v-btn @click="addTagFlag=false" dense small icon>
            <v-icon>
              mdi-close
            </v-icon>
          </v-btn>
          <input v-model="addingTag" class="addTag" @mousedown.stop autofocus @keydown.enter="addTag(relation)">
        </div>
        <v-btn dense small icon @click="openQuery(relation)">
          <v-icon>
            mdi-information
          </v-icon>
        </v-btn>
        <v-btn dense small icon>
          <v-icon>
            mdi-link
          </v-icon>
        </v-btn>
        <v-btn dense small icon>
          <v-icon>
            mdi-file
          </v-icon>
        </v-btn>
        <v-btn dense small icon>
          <v-icon>
            mdi-image
          </v-icon>
        </v-btn>
      </div>
      <input v-model="relation.name" @focus="focusItem(relation)">
      <div class="relation-info">
        <span v-for="category in relation.categories" :key="category.id">{{ category.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>
  import EventBus from '@/event-bus'

  class Concept {
    constructor() {
      this.objectType = 'concept'
      this.name = ''
      this.id = Math.floor(Math.random()*100000)
      this.data = 'file'

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
      this.offsetX = 0
      this.offsetY = 0

      //Attributes for easier parsing
      this.categories = []
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

  export default {
    name: 'BoardView',

    data: () => ({
      rectangle: null,
      focusedItem: null,
      addTagFlag: false,
      addingTag: '',
      creatingRelation: [],
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
      selectingArea: {
        require: true,
      }
    },

    methods: {
      openQuery(object) {
        EventBus.$emit('openQuery', object)
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
      boardMouseDown(event) {
        if (event.target.id=="generalSVG") {
          if (this.focusedItem) {
            this.focusedItem = null
          }
          else if (this.selectingArea) {
            let mapRect = document.getElementById('board').getBoundingClientRect()
            this.initialX = event.clientX - mapRect.left;
            this.initialY = event.clientY - mapRect.top;
            this.rectangle = {
                  left: this.initialX + 'px',
                  top: this.initialY + 'px',
                  width: '0px',
                  height: '0px',
              };
            }
          else {
            let concept = new Concept()
            concept.x = event.x - event.target.getBoundingClientRect().left
            concept.y = event.y - event.target.getBoundingClientRect().top

            EventBus.$emit('addItem', concept)

            this.$nextTick(()=>{
            if (this.$refs.concept) {
              this.$refs.concept.forEach((conceptElement) => {
                this.dragConcept(conceptElement)
              })
            }
          })
          }
        }
      },
      boardMouseMove(event) {
        if (this.creatingRelation[0]) {
          if (document.getElementById('creating-relation-line')) {
            let line = document.getElementById('creating-relation-line');
            line.setAttributeNS(null, 'x2', event.x);
            line.setAttributeNS(null, 'y2', event.y - 56);
          }
          else {
            let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.id = 'creating-relation-line'
            line.setAttributeNS(null, 'x1', this.creatingRelation[0][1].x + this.creatingRelation[0][1].width/2);
            line.setAttributeNS(null, 'y1', this.creatingRelation[0][1].y - 56 + this.creatingRelation[0][1].height/2);
            line.setAttributeNS(null, 'x2', event.x);
            line.setAttributeNS(null, 'y2', event.y);
            line.setAttributeNS(null, 'stroke', 'white');
            line.setAttributeNS(null, 'stroke-width', '1');

            document.getElementById('generalSVG').appendChild(line)
          }
        }
        if (this.rectangle) {
          let mapRect = document.getElementById('board').getBoundingClientRect()
              const width = event.clientX - this.initialX - mapRect.left;
              const height = event.clientY - this.initialY - mapRect.top;
              this.rectangle.width = Math.abs(width) + 'px';
              this.rectangle.height = Math.abs(height) + 'px';
              this.rectangle.left = width < 0 ? event.clientX - mapRect.left + 'px' : this.initialX + 'px';
              this.rectangle.top = height < 0 ? event.clientY - mapRect.top + 'px' : this.initialY + 'px';
          }
      },
      addTag(object) {
        let category;
        for (let i=0; i<this.categories.length; i++) {
          if (this.categories[i].name==this.addingTag) {
            category = this.categories[i]
            break
          }
        }
        if (category) {
          EventBus.$emit('addTag', object, category)
        }
        else {
          let category = new Category(this.addingTag)
          EventBus.$emit('addItem', category)

          EventBus.$emit('addTag', object, category)
        }
        this.addTagFlag = false
        this.addingTag = ''
      },
      createRelation(event) {
        let element = event.target
        let conceptTarget = this.getObjectById(element.parentElement.parentElement.getAttribute('data-id'))

        if (!this.creatingRelation[0]) {
          let coords = {
            'x': event.target.parentElement.getBoundingClientRect().left,
            'y': event.target.parentElement.getBoundingClientRect().top,
            'height': event.target.parentElement.getBoundingClientRect().height,
            'width': event.target.parentElement.getBoundingClientRect().width,
          }

          element.parentElement.classList.add('relation-node')
          this.creatingRelation.push([conceptTarget, coords])
        }
        else {
          let coords = {
            'x': event.target.parentElement.getBoundingClientRect().left,
            'y': event.target.parentElement.getBoundingClientRect().top,
            'height': event.target.parentElement.getBoundingClientRect().height,
            'width': event.target.parentElement.getBoundingClientRect().width,
          }

          element.parentElement.classList.add('relation-node')
          this.creatingRelation.push([conceptTarget, coords])
          let relation = new Relation()
          relation.object = this.creatingRelation[0][0]
          relation.subject = this.creatingRelation[1][0]

          relation.object = this.creatingRelation[0][0]
          relation.subject = this.creatingRelation[1][0]
          relation.offsetX1 = - relation.object.x + this.creatingRelation[0][1].x + this.creatingRelation[0][1].width/2
          relation.offsetY1 = - relation.object.y + this.creatingRelation[0][1].y - 56 + this.creatingRelation[0][1].height/2
          relation.offsetX2 = - relation.subject.x + this.creatingRelation[1][1].x + this.creatingRelation[1][1].width/2
          relation.offsetY2 = -relation.subject.y + this.creatingRelation[1][1].y - 56 + this.creatingRelation[1][1].height/2

          let line = document.getElementById('creating-relation-line');
          line.remove()

          EventBus.$emit('addItem', relation)

          this.creatingRelation = []
        }
      },
      focusItem(item) {
        this.focusedItem = item
      },
      hoveringBox(element) {
        var rect1 = element.getBoundingClientRect();
        let elements
        if (element.getAttribute("data-id")) {
          elements = document.querySelectorAll('.wordObj:not([data-id="'+element.getAttribute("data-id")+'"] .wordObj)');
        }
        else {
          elements = document.querySelectorAll('.wordObj')
        }

        for (let i = 0; i < elements.length; i++) {
          var element2 = elements[i];
          if (element2 === element) {
              continue;
          }
          var rect2 = element2.getBoundingClientRect();
          var overlaps = !(
            rect1.right < rect2.left ||
            rect1.left > rect2.right ||
            rect1.bottom < rect2.top ||
            rect1.top > rect2.bottom
          );
          if (overlaps) {
            return element2;
          }
        }
        return null;
      },
      dragConcept(word) {
        const vm = this;
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        var wordObj = this.getObjectById(word.getAttribute('data-id'))
        var original = [parseInt(wordObj.x), parseInt(wordObj.y)];
      
        word.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
          e.stopPropagation()

          e = e || window.event;
          e.preventDefault();
          pos3 = e.clientX;
          pos4 = e.clientY;
          document.onmouseup = closeDragElement;
          document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
          var wordObj = vm.getObjectById(word.getAttribute('data-id'))

          e = e || window.event;
          e.preventDefault();

          pos1 = pos3 - (e.clientX);
          pos2 = pos4 - (e.clientY);
          pos3 = e.clientX;
          pos4 = e.clientY;

          wordObj.y = (word.offsetTop - pos2)
          wordObj.x = (word.offsetLeft - pos1)

          if (vm.hoveringBox(word)) {
            word.classList.add('hovering')
            word.setAttribute('data-hover', vm.hoveringBox(word).getAttribute('data-id'))
          }
          else {
            word.classList.remove('hovering')
          }
        }

        function closeDragElement() {
          document.onmouseup = null;
          document.onmousemove = null;

          if (word.classList.contains('hovering')) {
            wordObj.x = original[0]
            wordObj.y = original[1]

            word.setAttribute('data-hover', '')
            word.classList.remove('hovering')
          }
          else {
            original = [wordObj.x, wordObj.y];
          }
        }
      },
      boardMouseUp() {
        this.rectangle = null;
      }
    },

    created() {
      this.$nextTick(()=>{
        if (this.$refs.concept) {
          this.$refs.concept.forEach((conceptElement) => {
            this.dragConcept(conceptElement)
          })
        }
      })
    }
  }
</script>
