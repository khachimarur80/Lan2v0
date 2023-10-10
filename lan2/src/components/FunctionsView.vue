<template>
  <div id="functions" @mousemove="functionMouseMove">
    <svg id="generalFunctionsSVG" height="100%" width="100%">
      <template v-for="condition in conditions">
        <template v-for="(item, i) in condition.items">
          <line 
            v-if="!item[1]"
            :x1="item[0].x+item[0].offsetX+'px'"
            :y1="item[0].y+item[0].offsetY+'px'"
            :x2="condition.x+condition.statementOffsetX+'px'"
            :y2="condition.y+condition.statementOffsetY+'px'"
            width="1"
            stroke="yellow"
            :key="i"
          >
          </line>
        </template>
      </template>
      <template v-for="action in actions">
        {{ action.condition }}
        <line 
          v-if="action.condition"
          :x1="action.condition.x+action.condition.actionOffsetX+'px'"
          :y1="action.condition.y+action.condition.actionOffsetY+'px'"
          :x2="action.x+action.offsetX+'px'"
          :y2="action.y+action.offsetY+'px'"
          width="1"
          stroke="orange"
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
            <span v-for="(element, key) in item[0].items[0]" :key="key">{{ element }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="action" v-for="(action, i) in actions" :key="i" :style="{ top : action.y+'px', left : action.x+'px'}" :data-id="action.id" ref="action" draggable="true">
      <span class="node action-node" @mousedown.stop>
        <span class="node-inner" @click="createAction">
      </span>
      </span>
      <div class="action-inner">
        <input @mousedown.stop v-model="action.name">
      </div>
    </div>
  </div>
</template>

<script>

  import EventBus from '@/event-bus.js';

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
        let rect1 = element.getBoundingClientRect();
        let elements
        if (element.getAttribute("data-id")) {
          elements = document.querySelectorAll('.wordObj:not([data-id="'+element.getAttribute("data-id")+'"] .wordObj)');
        }
        else {
          elements = document.querySelectorAll('.wordObj')
        }

        for (let i = 0; i < elements.length; i++) {
          let element2 = elements[i];
          if (element2 === element) {
              continue;
          }
          let rect2 = element2.getBoundingClientRect();
          let overlaps = !(
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
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        let wordObj = this.getObjectById(word.getAttribute('data-id'))
        let original = [parseInt(wordObj.x), parseInt(wordObj.y)];
      
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
          let wordObj = vm.getObjectById(word.getAttribute('data-id'))

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
          let coords = {
            'x': event.target.parentElement.getBoundingClientRect().left,
            'y': event.target.parentElement.getBoundingClientRect().top,
            'height': event.target.parentElement.getBoundingClientRect().height,
            'width': event.target.parentElement.getBoundingClientRect().width,
          }

          element.parentElement.classList.add('relation-node')
          this.creatingAction.push([conceptTarget, coords])
        }
        else {
          let coords = {
            'x': event.target.parentElement.getBoundingClientRect().left,
            'y': event.target.parentElement.getBoundingClientRect().top,
            'height': event.target.parentElement.getBoundingClientRect().height,
            'width': event.target.parentElement.getBoundingClientRect().width,
          }

          element.parentElement.classList.add('relation-node')

          conceptTarget.condition = this.creatingAction[0][0]

          this.creatingAction[0][0].actionOffsetX = -this.creatingAction[0][0].x + this.creatingAction[0][1].x + this.creatingAction[0][1].width/2
          this.creatingAction[0][0].actionOffsetY = -this.creatingAction[0][0].y + this.creatingAction[0][1].y + this.creatingAction[0][1].height/2 - 56

          conceptTarget.offsetX = -conceptTarget.x + coords.x + coords.width/2
          conceptTarget.offsetY = -conceptTarget.y + coords.y + coords.height/2 - 56

          let line = document.getElementById('creating-action-line');
          line.remove()

          this.creatingAction = []
        }
      },
      createCondition(event) {
        let element = event.target

        let conceptTarget = this.getObjectById(element.parentElement.parentElement.getAttribute('data-id'))

        if (!this.creatingCondition[0]) {
          let coords = {
            'x': event.target.parentElement.getBoundingClientRect().left,
            'y': event.target.parentElement.getBoundingClientRect().top,
            'height': event.target.parentElement.getBoundingClientRect().height,
            'width': event.target.parentElement.getBoundingClientRect().width,
          }

          element.parentElement.classList.add('relation-node')
          this.creatingCondition.push([conceptTarget, coords])
        }
        else {
          let coords = {
            'x': event.target.parentElement.getBoundingClientRect().left,
            'y': event.target.parentElement.getBoundingClientRect().top,
            'height': event.target.parentElement.getBoundingClientRect().height,
            'width': event.target.parentElement.getBoundingClientRect().width,
          }

          element.parentElement.classList.add('relation-node')

          conceptTarget.items.push([this.creatingCondition[0][0], false])
          conceptTarget.items.push(['and', true])

          let line = document.getElementById('creating-condition-line');
          line.remove()

          this.creatingCondition[0][0].offsetX = -this.creatingCondition[0][0].x + this.creatingCondition[0][1].x + this.creatingCondition[0][1].width/2
          this.creatingCondition[0][0].offsetY = -this.creatingCondition[0][0].y + this.creatingCondition[0][1].y + this.creatingCondition[0][1].height/2 - 56

          conceptTarget.statementOffsetX = -conceptTarget.x + coords.x + coords.width/2
          conceptTarget.statementOffsetY = -conceptTarget.y + coords.y + coords.height/2 - 56

          this.creatingCondition = []
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

            line.setAttributeNS(null, 'x1', this.creatingCondition[0][1].x + this.creatingCondition[0][1].width/2);
            line.setAttributeNS(null, 'y1', this.creatingCondition[0][1].y + this.creatingCondition[0][1].height/2 - 56);
            line.setAttributeNS(null, 'x2', event.x - functions.left);
            line.setAttributeNS(null, 'y2', event.y - functions.top);
            line.setAttributeNS(null, 'stroke', 'yellow');
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

            line.setAttributeNS(null, 'x1', this.creatingAction[0][1].x + this.creatingAction[0][1].width/2);
            line.setAttributeNS(null, 'y1', this.creatingAction[0][1].y + this.creatingAction[0][1].height/2 - 56);
            line.setAttributeNS(null, 'x2', event.x - functions.left);
            line.setAttributeNS(null, 'y2', event.y - functions.top);
            line.setAttributeNS(null, 'stroke', 'orange');
            line.setAttributeNS(null, 'stroke-width', '1');

            document.getElementById('generalFunctionsSVG').appendChild(line)
          }
        }
      },
      updateStatementsDrag() {
        this.$nextTick(()=>{
          if (this.$refs.statement) {
            this.$refs.statement.forEach((statementElement) => {
              this.dragConcept(statementElement)
            })
          }
        })
      },
      updateActionsDrag() {
        this.$nextTick(()=>{
          if (this.$refs.action) {
              this.$refs.action.forEach((actionElement) => {
                this.dragConcept(actionElement)
              })
            }
        })
      },
      updateConditionsDrag() {
        this.$nextTick(()=>{
          if (this.$refs.condition) {
              this.$refs.condition.forEach((conditionElement) => {
                this.dragConcept(conditionElement)
              })
            }
        })
      }
    },

    created() {
      EventBus.$on('updateActionsDrag', this.updateActionsDrag)
      EventBus.$on('updateConditionsDrag', this.updateConditionsDrag)
      EventBus.$on('updateStatementsDrag', this.updateStatementsDrag)

      setTimeout(()=>{
        if (this.$refs.statement) {
          this.$refs.statement.forEach((statementElement) => {
            this.dragConcept(statementElement)
          })
        }
      }, 500)
      setTimeout(()=>{
        if (this.$refs.condition) {
          this.$refs.condition.forEach((conditionElement) => {
            this.dragConcept(conditionElement)
          })
        }
      }, 500)
      setTimeout(()=>{
        if (this.$refs.action) {
            this.$refs.action.forEach((actionElement) => {
              this.dragConcept(actionElement)
            })
          }
      }, 500)
    }
  }
</script>
