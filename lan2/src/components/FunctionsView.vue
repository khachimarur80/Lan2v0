<template>
  <div id="functions" @mousedown="functionMouseDown" @mousemove="functionMouseMove">
    <svg id="generalFunctionsSVG" height="100%" width="100%">
      <template v-for="condition in conditions">
        <template v-for="(item, i) in condition.items">
          <line 
            v-if="!item[1]"
            :x1="item[0][0].x+70+'px'"
            :y1="item[0][0].y+'px'"
            :x2="condition.x+'px'"
            :y2="condition.y-30+'px'"
            width="1"
            stroke="white"
            :key="i"
          >
          </line>
        </template>
      </template>
      <template v-for="action in actions">
        {{ action.condition }}
        <line 
          v-if="action.condition"
          :x1="action.condition[0].x+'px'"
          :y1="action.condition[0].y + 30+'px'"
          :x2="action.x+'px'"
          :y2="action.y+20+'px'"
          width="1"
          stroke="white"
          :key="action.id"
        >
        </line>
      </template>
    </svg>
    <div class="statement" v-for="statement in statements" :key="statement.id" :style="{ top : statement.y+'px', left : statement.x+'px'}" :data-id="statement.id" ref="statement" draggable="true">
      <div class="statement-inner">
        <input v-for="(item, i) in statement.items" :key="i" @mousedown.stop style="width: 0px" v-model="item[1]" :class="'statement-'+item[0]">
      </div>
      <span class="node statement-node" @mousedown.stop>
        <span class="node-inner" @click="createCondition">
        </span>
      </span>
    </div>
    <div class="condition" v-for="condition in conditions" :key="condition.id" :style="{ top : condition.y+'px', left : condition.x+'px'}" :data-id="condition.id" ref="condition" draggable="true">
      <span class="node condition-node" @mousedown.stop>
        <span class="node-inner" @click="createCondition">
        </span>
      </span>
      <span class="node action-node" @mousedown.stop>
        <span class="node-inner" @click="createAction">
        </span>
      </span>
      <div class="condition-inner">
        <div v-for="(item, i) in condition.items" :key="i" style="width:100%;">
          <div v-if="item[1]">
            <input @mousedown.stop v-model="item[0]" :disabled="!item[1]">
          </div>
          <div v-else style="display: flex; justify-content: space-evenly; width:100%;">
            <span v-for="(i, key) in item[0][0].items" :key="key">{{ i[1] }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="action" v-for="(action, i) in actions" :key="i" :style="{ top : action.y+'px', left : action.x+'px'}" :data-id="action.id" ref="action" draggable="true">
      <span class="node action-node" @mousedown.stop>
        <span class="node-inner" @click="createAction">
        </span>
      </span>
      <div class="condition-inner">
        <input @mousedown.stop v-model="action.name" style="width: 0px">
      </div>
    </div>
  </div>
</template>

<script>

  import EventBus from '@/event-bus.js';

  class Statement {
    constructor(type) {
      this.objectType = 'statement'
      this.id = Math.floor(Math.random()*100000)
      this.type = type
      this.items = []

      //Board values
      this.x = 100
      this.y = 100
    }
  }
  class Condition {
    constructor() {
      this.objectType = 'condition'
      this.id = Math.floor(Math.random()*100000)
      this.items = []

      //Board values
      this.x = 100
      this.y = 100
    }
  }

  export default {
    name: 'FunctionsView',

    data: () => ({
      creatingCondition: [],
      creatingAction: []
    }),

    props: {
      actions: {
          required: true,
      },
      conditions: {
          required: true,
      },
      statements: {
          required: true,
      }
    },

    methods: {
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
      getObjectById(id) {
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
      },
      createAction(event) {
        let element = event.target

        let conceptTarget = this.getObjectById(element.parentElement.parentElement.getAttribute('data-id'))

        if (!this.creatingAction[0]) {
          let coords
          if (event.target.parentElement.classList[1]=='right') {
            coords = {'x': 18, 'y': 1}
          }
          else if (event.target.parentElement.classList[1]=='left') {
            coords = {'x': -18, 'y': 1}
          }
          else if (event.target.parentElement.classList[1]=='up') {
            coords = {'x': -.5, 'y': -9}
          }
          else if (event.target.parentElement.classList[1]=='down') {
            coords = {'x': -.5, 'y': 9}
          }
          else {
            coords = {'x': 0, 'y': 0}
          }

          element.parentElement.classList.add('relation-node')
          this.creatingAction.push([conceptTarget, coords])
        }
        else {
          element.parentElement.classList.add('relation-node')
          conceptTarget.condition = this.creatingAction[0]

          let line = document.getElementById('creating-action-line');
          line.remove()

          this.creatingAction = []
        }
      },
      createCondition(event) {
        let element = event.target
        let conceptTarget = this.getObjectById(element.parentElement.parentElement.getAttribute('data-id'))

        if (!this.creatingCondition[0]) {
          let coords
          if (event.target.parentElement.classList[1]=='right') {
            coords = {'x': 18, 'y': 1}
          }
          else if (event.target.parentElement.classList[1]=='left') {
            coords = {'x': -18, 'y': 1}
          }
          else if (event.target.parentElement.classList[1]=='up') {
            coords = {'x': -.5, 'y': -9}
          }
          else if (event.target.parentElement.classList[1]=='down') {
            coords = {'x': -.5, 'y': 9}
          }
          else {
            coords = {'x': 0, 'y': 0}
          }

          element.parentElement.classList.add('relation-node')
          this.creatingCondition.push([conceptTarget, coords])
        }
        else {
          element.parentElement.classList.add('relation-node')

          conceptTarget.items.push([this.creatingCondition[0], false])
          conceptTarget.items.push(['and', true])

          let line = document.getElementById('creating-condition-line');
          line.remove()

          this.creatingCondition = []
        }
      },
      createStatement(type) {
        let statement = new Statement(type)

        EventBus.$emit('addItem', statement)

        if (type=='[]') {
          statement.items = [['tag', '']]
        }
        if (type=='#') {
          statement.items = [['concept', '']]
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

        this.$nextTick(()=>{
          if (this.$refs.statement) {
            this.$refs.statement.forEach((statementElement) => {
              this.dragConcept(statementElement)
            })
          }
        })
      },
      functionMouseDown(event) {
        event.preventDefault()
        if (event.target.id=="generalFunctionsSVG") {
          let condition = new Condition()
          condition.x = event.x - event.target.getBoundingClientRect().left
          condition.y = event.y - event.target.getBoundingClientRect().top

          EventBus.$emit('addItem', condition)

          this.$nextTick(()=>{
            if (this.$refs.condition) {
              this.$refs.condition.forEach((conditionElement) => {
                this.dragConcept(conditionElement)
              })
            }
          })
        }
      },
      functionMouseMove(event) {
        if (this.creatingCondition[0]) {
        const functions = document.getElementById('functions').getBoundingClientRect()
        if (document.getElementById('creating-condition-line')) {
          let line = document.getElementById('creating-condition-line');
          line.setAttributeNS(null, 'x2', event.x - functions.left);
          line.setAttributeNS(null, 'y2', event.y - functions.top);
        }
        else {
          let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
          line.id = 'creating-condition-line'
          let origin = document.querySelector('[data-id="'+this.creatingCondition[0][0].id+'"]').getBoundingClientRect()
          line.setAttributeNS(null, 'x1', origin.left + origin.width - functions.left + this.creatingCondition[0][1].x);
          line.setAttributeNS(null, 'y1', origin.top + origin.height/2 - functions.top + this.creatingCondition[0][1].y);
          line.setAttributeNS(null, 'x2', event.x - functions.left);
          line.setAttributeNS(null, 'y2', event.y - functions.top);
          line.setAttributeNS(null, 'stroke', 'white');
          line.setAttributeNS(null, 'stroke-width', '1');

          document.getElementById('generalFunctionsSVG').appendChild(line)
        }
      }
      else if (this.creatingAction[0]) {
        const functions = document.getElementById('functions').getBoundingClientRect()
        if (document.getElementById('creating-action-line')) {
          let line = document.getElementById('creating-action-line');
          line.setAttributeNS(null, 'x2', event.x - functions.left);
          line.setAttributeNS(null, 'y2', event.y - functions.top);
        }
        else {
          let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
          line.id = 'creating-action-line'
          let origin = document.querySelector('[data-id="'+this.creatingAction[0][0].id+'"]').getBoundingClientRect()
          line.setAttributeNS(null, 'x1', origin.left + origin.width/2 - functions.left + this.creatingAction[0][1].x);
          line.setAttributeNS(null, 'y1', origin.top + origin.height - functions.top + this.creatingAction[0][1].y);
          line.setAttributeNS(null, 'x2', event.x - functions.left);
          line.setAttributeNS(null, 'y2', event.y - functions.top);
          line.setAttributeNS(null, 'stroke', 'white');
          line.setAttributeNS(null, 'stroke-width', '1');

          document.getElementById('generalFunctionsSVG').appendChild(line)
        }
      }
      },
    },

    created() {
      EventBus.$on('createStatement', this.createStatement)

      this.$nextTick(()=>{
        if (this.$refs.statement) {
          this.$refs.statement.forEach((statementElement) => {
            this.dragConcept(statementElement)
          })
        }
      })
      this.$nextTick(()=>{
        if (this.$refs.condition) {
          this.$refs.condition.forEach((conditionElement) => {
            this.dragConcept(conditionElement)
          })
        }
      })
      this.$nextTick(()=>{
        if (this.$refs.action) {
            this.$refs.action.forEach((actionElement) => {
              this.dragConcept(actionElement)
            })
          }
      })
    }
  }
</script>
