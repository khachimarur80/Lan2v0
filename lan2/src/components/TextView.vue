<template>
  <v-container>
    <div id="text">
      <v-card width="80%" min-height="100%"  outlined class="pa-1 pt-3 text-content">
        <div 
          style="height: 100%; width: 100%; outline: none;" 
          @click="lineClick"
          @keyup="lineKeyup" 
          @keydown="lineKeydown"
          @dblclick="lineDoubleClick"  
          contenteditable 
          >
          <div :class="['line', currentLine==i ? 'currentLine' : '']" v-for="(line, i) in lines" :key="i">
            <div class="references" contenteditable="false">
              <v-btn icon text color="amber" dense small>
                <v-icon>
                  mdi-file-link-outline
                </v-icon>
              </v-btn>
            </div>
            <div class="line-count text-body-1" contenteditable="false">
              {{ i + 1 }}
            </div>
            <div class="line-contents text-body-1" contenteditable :data-num="i" ref="lineContents">{{ line }}</div>
            <div class="comments" contenteditable="false">
              <v-btn icon text color="primary" dense small>
                <v-icon>
                  mdi-comment-text-outline
                </v-icon>
              </v-btn>
            </div>
          </div>
          <v-dialog v-model="creatingRelation" width="270" class="pa-2">
            <v-card v-if="!relationExists">
              <v-card-title class="text-h5">
                Create relation
              </v-card-title>
              <v-divider></v-divider>
              <div class="text-body-1 px-6">
                Subject: {{ subject }}
              </div>

              <div class="text-body-1 px-6">
                Object: {{ object }}
              </div>
              <v-divider></v-divider>
              <br>
              <div class="text-body-1 px-6">
                Relation name:
              </div>
              <div class="px-10">
                <v-text-field hide-details dense v-model="relation">
                </v-text-field>
              </div>
              <br>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" outlined @click="createRelation(false)">
                  Cancel
                </v-btn>
                <v-btn color="success" outlined @click="createRelation(true)">
                  Create
                </v-btn>
              </v-card-actions>
            </v-card>
            <v-card v-else>
              <v-card-title>
                Relation already exists!
              </v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="success" outlined @click="createRelation(false)">
                  Ok
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>
      </v-card>
    </div>
  </v-container>
</template>

<script>

function insertTextAtCaret(text) {
  var sel, range;
  if (window.getSelection) {
      sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
          range = sel.getRangeAt(0);
          range.deleteContents();
          range.insertNode( document.createTextNode(text) );
      }
  } else if (document.selection && document.selection.createRange) {
      document.selection.createRange().text = text;
  }
}

function placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}

function getCursorPosition(parent, node, offset, stat) {
  if (stat.done) return stat;

  let currentNode = null;

  if (parent.childNodes.length == 0) {
    stat.pos += parent.textContent.length;
  } else {
    for (let i = 0; i < parent.childNodes.length && !stat.done; i++) {
      currentNode = parent.childNodes[i];
      if (currentNode === node) {
        stat.pos += offset;
        stat.done = true;
        return stat;
      } else getCursorPosition(currentNode, node, offset, stat);
    }
  }
  return stat;
}

function setCursorPosition(parent, range, stat) {
  if (stat.done) return range;

  if (parent.childNodes.length == 0) {
    if (parent.textContent.length >= stat.pos) {
      range.setStart(parent, stat.pos);
      stat.done = true;
    } else {
      stat.pos = stat.pos - parent.textContent.length;
    }
  } else {
    for (let i = 0; i < parent.childNodes.length && !stat.done; i++) {
      let currentNode = parent.childNodes[i];
      setCursorPosition(currentNode, range, stat);
    }
  }
  return range;
}

// eslint-disable-next-line
function findSelectedDivs(node, range) {
    const selectedDivs = [];
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT, null, false);

    let currentNode = walker.nextNode();

    while (currentNode) {
        if (currentNode.nodeName === 'DIV') {
            const nodeRange = document.createRange();
            nodeRange.selectNodeContents(currentNode);

            if (range.intersectsNode(currentNode)) {
                selectedDivs.push(currentNode);
            }

            if (nodeRange.compareBoundaryPoints(Range.END_TO_END, range) >= 0) {
                break;
            }
        }

        currentNode = walker.nextNode();
    }
    return selectedDivs
}


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

import EventBus from '@/event-bus'
//import { marked } from 'marked';

export default {
  name: 'QueryView',

  data: () => ({
    selectedQuery: [],
    lines: [],
    object: null,
    subject: null,
    relation: null,
    creatingRelation: null,
    relationExists: false,
    currentLine: null,
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
    contents: {
      required: true,
    }
  },

  methods: {
    parseConcepts(lines) {
      const lineContents = lines;

      for (let i=0; i<lineContents.length; i++) {
        let words = lineContents[i].innerText.split(' ')
        words = Array.from(new Set(words)).filter(word => word.trim() !== '')

        for (let j=0; j<words.length; j++) {
          let concept = this.concepts.find(concept => concept.name==words[j].trim())
          if (concept) {
            let word = words[j].trim();
            let regex = new RegExp(`\\b${word}\\b`, 'g');
            lineContents[i].innerHTML = this.lines[i].replace(regex, `<span contenteditable="false" class="inline-concept">${word}</span>`);
          }
        }
      }
    },
    createRelation(create) {
      if (create) {
        let relation = new Relation()
        relation.name = this.relation

        let object = this.concepts.find(concept => concept.name==this.object)
        let subject = this.concepts.find(concept => concept.name==this.subject)

        relation.object = object.id
        relation.subject = subject.id

        EventBus.$emit('addItem', relation)
      }

      this.creatingRelation = false

      this.relation = ''
      this.object = null
      this.subject = null
      document.querySelectorAll('.highlight-concept').forEach(element => element.classList.remove('highlight-concept'))
    },


    lineKeyup(event) {
      if (event.key==' ' || event.key=='Enter') {
        event.preventDefault()
      }
      else {
        this.lines[parseInt(event.target.getAttribute('data-num'))] = event.target.innerText
        EventBus.$emit('updateContents', this.lines)
      }
    },
    lineKeydown(event) {
      let currentLine = document.querySelector('div[data-num="'+this.currentLine+'"]')

      if (event.key==' ') {
        const sel = window.getSelection();
        const node = sel.focusNode;
        const offset = sel.focusOffset;
        const pos = getCursorPosition(currentLine, node, offset, { pos: 0, done: false });
        if (offset === 0) pos.pos += 0.5;

        this.parseConcepts([currentLine])

        sel.removeAllRanges();
        const range = setCursorPosition(currentLine, document.createRange(), {
          pos: pos.pos,
          done: false,
        });
        range.collapse(true);
        sel.addRange(range);
      }
      else if (event.key=='Enter') {
        event.preventDefault()

        let sel = window.getSelection();
        let range = sel.getRangeAt(0);
        let startOffset = range.startOffset;
        let startContainer = range.startContainer;

        if (startOffset === currentLine.innerText.length) {
          this.lines.splice(this.currentLine + 1, 0, '')

          this.$nextTick(()=>{
            const newTarget = document.querySelector('div[data-num="'+(this.currentLine+1)+'"]')

            sel.removeAllRanges();
            const range = setCursorPosition(newTarget, document.createRange(), {
              pos: 0,
              done: false,
            });
            range.collapse(true);
            sel.addRange(range);

            this.currentLine += 1
          })
        }
        
        else {
          let oldLineText = startContainer.textContent.slice(0, startOffset)
          let newLineText = startContainer.textContent.slice(startOffset, startContainer.textContent.length)

          this.lines[this.currentLine] = oldLineText
          currentLine.innerText = oldLineText

          this.lines.splice(this.currentLine + 1, 0, newLineText)

          this.$nextTick(()=>{
            const newLine = document.querySelector('div[data-num="'+(this.currentLine+1)+'"]')

            sel.removeAllRanges();
            const range = setCursorPosition(newLine, document.createRange(), {
              pos: 0,
              done: false,
            });
            range.collapse(true);
            sel.addRange(range);

            this.currentLine += 1
          })
        }
      }
      else if (event.key=='Backspace') {
        let sel = window.getSelection();
        let range = sel.getRangeAt(0);
        let startOffset = range.startOffset;
        console.log(startOffset)

        if (this.lines.length>1) {
            if (startOffset === 0) {
              event.preventDefault()
          
              const newTarget = document.querySelector('div[data-num="'+(this.currentLine-1).toString()+'"]')

              this.lines[this.currentLine-1] += this.lines[this.currentLine]

              placeCaretAtEnd(newTarget)
              insertTextAtCaret(this.lines[this.currentLine])

              this.lines.splice(this.currentLine, 1)

              this.currentLine -= 1
            } 
        }
      }
      else if (event.key=='ArrowUp') {
        event.preventDefault()

        let num = parseInt(currentLine.getAttribute('data-num'))
        if (num>0) {
          this.currentLine -= 1

          let target = document.querySelector('div[data-num="'+(num-1)+'"]')

          const sel = window.getSelection();
          const node = sel.focusNode;
          const offset = sel.focusOffset;
          const pos = getCursorPosition(currentLine, node, offset, { pos: 0, done: false });
          if (offset === 0) pos.pos += 0.5;


          sel.removeAllRanges();
          const range = setCursorPosition(target, document.createRange(), {
            pos: Math.min(pos.pos, target.innerText.length),
            done: false,
          });
          range.collapse(true);
          sel.addRange(range);
        }
      }
      else if (event.key=='ArrowDown') {
        event.preventDefault()

        let num = parseInt(currentLine.getAttribute('data-num'))
        if (num<this.lines.length-1) {
          this.currentLine += 1

          let target = document.querySelector('div[data-num="'+(num+1)+'"]')

          const sel = window.getSelection();
          const node = sel.focusNode;
          const offset = sel.focusOffset;
          const pos = getCursorPosition(currentLine, node, offset, { pos: 0, done: false });
          if (offset === 0) pos.pos += 0.5;


          sel.removeAllRanges();
          const range = setCursorPosition(target, document.createRange(), {
            pos: Math.min(pos.pos, target.innerText.length),
            done: false,
          });
          range.collapse(true);
          sel.addRange(range);
        }
      }
    },
    lineClick(event) {
      if (this.lines.length==0) {
        this.lines.push('')

        this.$nextTick(()=>{
          const newTarget = document.querySelector('div[data-num="0"]')
          placeCaretAtEnd(newTarget)
        })

        this.currentLine = 0
      }
      else if (event.target.classList.contains('inline-concept')) {
        if (event.target.classList.contains('highlight-concept')) {
          this.subject = null
          document.querySelectorAll('.highlight-concept').forEach(element => element.classList.remove('highlight-concept'))
        }
        else {
          if (this.subject) {
            this.object = event.target.innerText

            event.target.classList.add('highlight-concept')

            let objects = Array.from(document.querySelectorAll('.inline-concept')).filter(element => element.innerText == event.target.innerText)

            objects.forEach(object => object.classList.add('highlight-concept'))

            this.creatingRelation = true

            let object = this.concepts.find(concept => concept.name==this.object).id
            let subject = this.concepts.find(concept => concept.name==this.subject).id

            this.relationExists = this.relations.find(relation => (relation.object==object && relation.subject==subject) || (relation.subject==object && relation.object==subject))
          }
          else {
            this.subject = event.target.innerText

            let subjects = Array.from(document.querySelectorAll('.inline-concept')).filter(element => element.innerText == event.target.innerText)

            subjects.forEach(subject => subject.classList.add('highlight-concept'))
          }
        }
      }
      else if (event.target.classList.contains('line-contents')){
        this.currentLine = parseInt(event.target.getAttribute('data-num'))
      }
    },
    lineDoubleClick() {
      let selection = window.getSelection();
      let range = selection.getRangeAt(0);
      let selectedText = range.toString();
      
      if (selectedText) {
        let span = document.createElement("span");
        span.setAttribute("contenteditable", "false")
        span.classList.add("inline-concept")
        span.appendChild(document.createTextNode(selectedText));
        
        range.deleteContents();
        range.insertNode(span);

        selection.removeAllRanges();

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
          
          concept.x = circle*80*Math.cos(angle)
          concept.y = circle*80*Math.sin(angle)

        EventBus.$emit('addItem', concept)

        this.parseConcepts(this.$refs.lineContents)
      }
    }
  },

  computed: {
  },

  created() {
    this.lines = this.contents
  },

  mounted() {
    const lineContents = this.$refs.lineContents;

    for (let i=0; i<lineContents.length; i++) {
      let words = lineContents[i].textContent.split(' ')
      words = Array.from(new Set(words)).filter(word => word.trim() !== '')
      for (let j=0; j<words.length; j++) {
        let concept = this.concepts.find(concept => concept.name==words[j].trim())
        if (concept) {
          let word = words[j].trim();
          let regex = new RegExp(`\\b${word}\\b`, 'g');

          lineContents[i].innerHTML = this.lines[i].replace(regex, `<span contenteditable="false" class="inline-concept">${word}</span>`);

          if (j==(words.length-1)) {
            lineContents[i].innerHTML += '&nbsp;'
          } 
        }
      }
    }
  },
}
</script>

<style scoped>
#text {
  height: calc(100vh - 80px);
  width: 100h;
  position: relative;
  padding: 20px;
  overflow: scroll;
}
.text-content {
  margin-left: 50%;
  transform: translateX(-50%);
}
.line {
  min-height: 24px;
  display: flex;
  position: relative;
  width: calc(100% + 70px);
  transform: translateX(-35px);
}

.currentLine:before {
  position: absolute;
  content: '';
  height: 10px;
  width: 10px;
  border-radius: 50%;
  background: var(--v-success-base);
  left: 37px;
  top: 50%;
  transform: translateY(-50%);
  animation: breathe 1s infinite ease-in-out;
  transform-origin: top center;
}
.currentLine .line-count {
  filter: brightness(.7);
}
@keyframes breathe {
  from {
    opacity: .4;
    transform: scale(.9) translateY(-50%);
  }
  50% {
    opacity: 1;
    transform: scale(1) translateY(-50%);
  }
  to {
    opacity: .4;
    transform: scale(.9) translateY(-50%);
  }
}

.line:focus-within .references,
.line:focus-within .comments {
  opacity: 1;
  pointer-events: auto;
}

.references {
  opacity: 0;
  pointer-events: none;
  margin-right: 30px;
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity .3s;
}
.line-count {
  width: 25px;
  filter: brightness(.3);
  user-select: none;
}
.line-contents {
  flex: 1;
  outline: none;
  cursor: text;
  white-space: nowrap;
}
.comments {
  opacity: 0;
  pointer-events: none;
  margin-left: 20px;
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity .3s;
}
</style>