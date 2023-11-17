<template>
  <div id="board" @mousedown="boardMouseDown" @mousemove="boardMouseMove" @mouseup="boardMouseUp">
    <div id="zoomVal">
      <v-btn icon dense small>
        <v-icon>
          mdi-minus
        </v-icon>
      </v-btn>
      <span class="text-body-2 ml-1">{{ parseInt(zoomVal*100) }} %</span>
      <v-btn icon dense small>
        <v-icon>
          mdi-plus
        </v-icon>
      </v-btn>
    </div>
    <svg id="generalSVG" height="100%" width="100%">
      <line 
        v-for="(relation, i) in relations" 
        :key="i" 
        :x1="getObjectById(relation.object).x+'px'"
        :y1="getObjectById(relation.object).y+'px'"
        :x2="getObjectById(relation.subject).x+'px'"
        :y2="getObjectById(relation.subject).y+'px'"
      >
      </line>
    </svg>
    <div v-if="rectangle" class="rectangle" :style="{ top: rectangle.top, left: rectangle.left, width: rectangle.width, height: rectangle.height, } "></div>
    <div class="concept" v-for="concept in concepts" :key="concept.id" :style="conceptPos(concept)" :data-id="concept.id" ref="concept" draggable="true">
      <div class="concept-inner">
        <v-card>
          <div class="d-flex">
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
            <!--Al añadir file, puedes añadir, .txt, o .md. En el futuro, un .json de otra función o mapa! -->
            <v-btn dense small icon @click="addFile(concept)">
              <v-icon>
                mdi-file
              </v-icon>
            </v-btn>
            <v-btn dense small icon @click="addImage(concept)">
              <v-icon>
                mdi-image
              </v-icon>
            </v-btn>
            <v-btn dense small icon @click="addLink(concept)" v-if="!addLinkFlag">
              <v-icon>
                mdi-link
              </v-icon>
            </v-btn>
            <div v-else class="d-flex">
              <v-btn @click="addLink(concept)" dense small icon>
                <v-icon>
                  mdi-close
                </v-icon>
              </v-btn>
              <input v-model="addingLink.contents" style="border-color: white" @mousedown.stop autofocus @input="concept.data = 'link'">
            </div>
          </div>

          <div class="text-center text-h6">
            {{ concept.name }}
          </div>
        </v-card>
      </div>
      <div class="concept-info">
        <span v-for="category in concept.categories" :key="category">{{ getObjectById(category).name }}</span>
      </div>
      <span class="node center" @mousedown.stop>
        <span class="node-inner" @click="createRelation">
        </span>
      </span>
    </div>
    <div class="relation" v-for="relation in relations" :key="relation.id" :style="{ top : (getObjectById(relation.object).y+getObjectById(relation.subject).y)/2 + 'px', left : (getObjectById(relation.object).x+getObjectById(relation.subject).x)/2 + 'px' }" :data-id="relation.id">
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
      </div>
      <input v-model="relation.name" @focus="focusItem(relation)" :style="{ width : relation.name.length*12+'px', transform: 'rotate('+ relationRotation(relation) +  'deg)'}">
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
      addLinkFlag: false,
      addingLink: null,
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
      },
      zoomVal: {
        require: true,
      }
    },

    methods: {
      addLink(concept) {
        if (!this.addLinkFlag) {
          this.addLinkFlag = true
          this.addingLink = concept
        }
        else {
          this.addLinkFlag = false
        }
      },
      async addFile(concept) {
        const message = await new Promise(resolve => {
          window.electronAPI.openFileBrowser('text')
          window.electronAPI.response('open-file-browser-response', resolve)
        });
        concept.data = 'file'
        concept.contents = message
      },
      async addImage(concept) {
        const message = await new Promise(resolve => {
          window.electronAPI.openFileBrowser('image')
          window.electronAPI.response('open-file-browser-response', resolve)
        });
        concept.data = 'image'
        concept.contents = message
      },
      openQuery(object) {
        EventBus.$emit('openQuery', object)
      },
      getObjectById(id) {
        for(let i=0; i<this.concepts.length; i++) {
          if (this.concepts[i].id==id) {
            return this.concepts[i]
          }
        }
        for(let i=0; i<this.categories.length; i++) {
          if (this.categories[i].id==id) {
            return this.categories[i]
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
            const rect = document.getElementById('board').getBoundingClientRect();

            concept.x = event.x - rect.left
            concept.y = event.y - rect.top

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

            line.setAttributeNS(null, 'x2', event.clientX);
            line.setAttributeNS(null, 'y2', event.clientY - 55);
          }
          else {
            let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.id = 'creating-relation-line'

            line.setAttributeNS(null, 'x1', this.creatingRelation[0][1].x + this.creatingRelation[0][1].width/2);
            line.setAttributeNS(null, 'y1', this.creatingRelation[0][1].y - 55 + this.creatingRelation[0][1].height/2);
            line.setAttributeNS(null, 'x2', event.x);
            line.setAttributeNS(null, 'y2', event.y);
            line.setAttributeNS(null, 'stroke', 'red');
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
          relation.object = this.creatingRelation[0][0].id
          relation.subject = this.creatingRelation[1][0].id

          this.creatingRelation[0][0].relations.push(relation.id)
          this.creatingRelation[1][0].relations.push(relation.id)
          
          /*relation.offsetX1 = - this.creatingRelation[0][0].x + this.creatingRelation[0][1].x + this.creatingRelation[0][1].width/2
          relation.offsetY1 = - this.creatingRelation[0][0].y + this.creatingRelation[0][1].y - 56 + this.creatingRelation[0][1].height/2
          relation.offsetX2 = - this.creatingRelation[1][0].x + this.creatingRelation[1][1].x + this.creatingRelation[1][1].width/2
          relation.offsetY2 = - this.creatingRelation[1][0].y + this.creatingRelation[1][1].y - 56 + this.creatingRelation[1][1].height/2*/

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
        // eslint-disable-next-line
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

          wordObj.x = word.offsetLeft - pos1
          wordObj.y = word.offsetTop - pos2

          if (vm.hoveringBox(word)) {
            word.classList.add('hovering')
            word.setAttribute('data-hover', vm.hoveringBox(word).getAttribute('data-id'))
          }
          else {
            word.classList.remove('hovering')
          }
        }

        function closeDragElement() {
          EventBus.$emit('saveData')

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

    computed : {
      relationRotation() {
        return (relation) => {
          const obj1 = this.getObjectById(relation.subject);
          const obj2 = this.getObjectById(relation.object);

          const deltaX = obj2.x - obj1.x;
          const deltaY = obj2.y - obj1.y;

          const radians = Math.atan2(deltaY, deltaX);
          let degrees = radians * (180 / Math.PI);

          // Adjust the angle to be in the range of -180 to 180 degrees
          if (degrees > 180) {
            degrees -= 360;
          } else if (degrees < -180) {
            degrees += 360;
          }

          degrees = (degrees+360)%360

          return degrees;
        }
      },
      conceptPos() {
        return (concept) => {
          return { top : concept.y + 'px', left : concept.x + 'px' }
        }
      }
    },
    created() {
      setTimeout(()=>{
        if (this.$refs.concept) {
          this.$refs.concept.forEach((conceptElement) => {
            this.dragConcept(conceptElement)
          })
        }
      }, 500)
    }
  }
</script>
<style scoped>

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
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: var(--v-success-base);
}
.concept:active {
  cursor: grab !important;
}
.concept:not(:active):hover .concept-inner {
  opacity: 1;
  pointer-events: auto;
}

.concept-inner {
  position: absolute;
  padding-top: 10px;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3px;
  opacity: 0;
  transition: opacity .3s;
  overflow: visible;
  pointer-events: none;
}
.concept input {
  outline: none;
  border: 1px solid var(--v-success-base);
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
  border-radius: 5px;
  min-width: 30px;
  width: fit-content;
  padding-left: 3px;
  padding-right: 3px;
  color: var(--v-primary-base);
  transform-origin: center;
  background: #121212;
}

line {
  stroke-width: 3px !important;
  stroke: var(--v-primary-base);
}

#board {
  flex: 1;
  height: calc(100% - 40px);
  cursor: crosshair;
  width: 100%;
  z-index: 2;
  position: relative;
}
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
#generalSVG {
  position: absolute;
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
#zoomVal {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #121212;
  cursor: default;
  user-select: none;
  z-index: 3;
}
</style>