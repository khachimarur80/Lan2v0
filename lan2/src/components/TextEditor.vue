<template>
  <div id="text">
    <v-card width="100%" height="100%"  class="pa-1 pt-3 text-content" style="border-radius: 0px !important; background: #161616;" elevation="0" outlined>
      <div 
        style="height: 100%; width: 100%; outline: none; color: transparent;" 
        @click="lineClick"
        @keyup="lineKeyup" 
        @keydown="lineKeydown"
        @dblclick="lineDoubleClick"
        id="text-content"
        contenteditable 
        >
        <div :class="['line', currentLine==i ? 'currentLine' : '',  blockType(line.type)]" v-for="(line, i) in file.contents" :key="file.name + i">
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
          <div class="line-contents" contenteditable :data-num="i" ref="lineContents" v-once>{{ line.contents }}</div>
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
</template>

<script>
import EventBus from '@/event-bus'

// eslint-disable-next-line
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

// eslint-disable-next-line
class Line {
  constructor() {
    this.contents = ''
    this.type = 'body'
    this.divisions = []
  }
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

//import { marked } from 'marked';

export default {
  name: 'TextEditor',

  data: () => ({
    selectedQuery: [],
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
    file: {
      required: true,
    }
  },

  methods: {
    blockType(type) {
      if (type === 'body') {
        return 'text-body-1'
      }
      else if (type.startsWith('h')) {
        return type
      }
    },
    parseFunctions(lines) {
      const lineContents = lines;
      
      for (let i=0; i<lineContents.length; i++) {
        let relations = lineContents[i].innerText.split(' ')
        relations = Array.from(new Set(relations)).filter(relation => relation.trim() !== '')
        
        for (let j=0; j<relations.length; j++) {
          let relation = this.relations.filter(obj => obj.name==relations[j])
          if (relation.length) {
            relation = relation[0]
            for (let k=0; k<relation.sentences.length; k++) {
              let words = relation.sentences[k].split(' ')
              let firstWord = words[0].slice(1,-1)
              let connection = words[1].slice(1,-1)
              let lastWord = words[2].slice(1,-1)

              if ((firstWord=='object' && j==0) || (lastWord=='subject' && j==relations.length-1)) {
                continue
              }
              else {
                if (firstWord=='object') {
                  firstWord = relations[j-1]
                }
                if (lastWord=='object') {
                  lastWord = relations[j-1]
                }
                if (firstWord=='subject') {
                  firstWord = relations[j+1]
                }
                if (lastWord=='subject') {
                  lastWord = relations[j+1]
                }
                

                let firstWordObj = this.concepts.filter(obj=>obj.name==firstWord)[0]
                let connectionObj = this.relations.filter(obj=>obj.name==connection)
                let lastWordObj = this.concepts.filter(obj=>obj.name==lastWord)[0]

                if (!firstWordObj || connectionObj.length<1 || !lastWordObj ) {
                  console.log('1')
                  if (!firstWordObj) {
                    firstWordObj = new Concept()
                    firstWordObj.name = firstWord

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
                      
                    const rect = document.getElementById('text').getBoundingClientRect();

                    firstWordObj.x = circle*80*Math.cos(angle) + rect.width/2
                    firstWordObj.y = circle*80*Math.sin(angle) + rect.height/2

                    EventBus.$emit('addItem', firstWordObj)
                  }
                  if (!lastWordObj) {
                    lastWordObj = new Concept()
                    lastWordObj.name = lastWord

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
                      
                    const rect = document.getElementById('text').getBoundingClientRect();

                    lastWordObj.x = circle*80*Math.cos(angle) + rect.width/2
                    lastWordObj.y = circle*80*Math.sin(angle) + rect.height/2

                    EventBus.$emit('addItem', lastWordObj)
                  }
                }

                let exists = false
                let bug = false

                for (let z=0; z<connectionObj.length; z++) {
                  if (connectionObj[z].object==firstWordObj.id && connectionObj[z].subject==lastWordObj.id) {
                    exists = true
                    break
                  }
                  else if (connectionObj[z].subject==firstWordObj.id && connectionObj[z].object==lastWordObj.id) {
                    bug = true
                    break
                  }
                }

                if (bug) {
                  //alert('INCONGRUENCE ON LINE '+i+' AT WORD '+j+'!')
                }
                else if (!exists) {
                  alert('NEW RELATION!')
                  let relation = new Relation()
                  relation.name = connection

                  let object = firstWordObj
                  let subject = lastWordObj

                  relation.object = object.id
                  relation.subject = subject.id

                  EventBus.$emit('addItem', relation)
                }
              }
            }
          }
        }
      }
    },
    parseConcepts(lines) {
      const lineContents = lines;
      
      for (let i=0; i<lineContents.length; i++) {
        let words = lineContents[i].innerText.split(' ')
        words = Array.from(new Set(words)).filter(word => word.trim() !== '')

        let regex = new RegExp(`\\b(` + words.map(word => word.trim()).join('|') + `)\\b`, 'g');

        for (let j=0; j<words.length; j++) {
          lineContents[i].innerHTML = this.file.contents[i].contents.replace(regex, (match) => {
            let matchingConcept = this.concepts.find(concept => concept.name == match.trim());
            if (matchingConcept) {
                return `<span class="inline-concept" contenteditable="false">${matchingConcept.name}</span> `;
            } 
            else {
                return match;
            }
        });
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
      event.preventDefault()
      let currentLine = document.querySelector('div[data-num="'+this.currentLine+'"]')
      if (currentLine) {
        EventBus.$emit('updateLine', this.currentLine, currentLine.innerText)
      }
      this.$emit('saveContents')
    },
    lineKeydown(event) {
      let currentLine = document.querySelector('div[data-num="'+this.currentLine+'"]')
      let selectedLines = findSelectedDivs(document.getElementById('text-content'), window.getSelection().getRangeAt(0)).filter(e => e.classList.contains('line'))
      selectedLines = selectedLines.map(e => e.querySelector('.line-contents'))

      if (selectedLines.length===1) {
        if (event.key=='Enter') {
          event.preventDefault()

          let sel = window.getSelection();
          let range = sel.getRangeAt(0);
          let startOffset = range.startOffset;
          let startContainer = range.startContainer;


          if (startOffset === currentLine.innerText.length) {
            let newLine = new Line()

            EventBus.$emit('appendLine', this.currentLine, newLine)


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

            EventBus.$emit('updateLine', this.currentLine, oldLineText)

            currentLine.innerText = oldLineText

            let newLine = new Line()
            newLine.contents = newLineText

            EventBus.$emit('appendLine', this.currentLine, newLine)

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

          if (this.file.contents.length>1) {
              if (startOffset === 0) {
                event.preventDefault()
            
                const newTarget = document.querySelector('div[data-num="'+(this.currentLine-1).toString()+'"]')

                let oldPos = newTarget.innerText.length

                let newContents = this.file.contents[this.currentLine-1].contents + this.file.contents[this.currentLine].contents
                EventBus.$emit('updateLine', this.currentLine-1, newContents)

                newTarget.innerText += this.file.contents[this.currentLine].contents

                sel.removeAllRanges();
                const range = setCursorPosition(newTarget, document.createRange(), {
                  pos: oldPos,
                  done: false,
                });
                range.collapse(true);
                sel.addRange(range);

                EventBus.$emit('removeLine', this.currentLine)

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
          if (num<this.file.contents.length-1) {
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
        else if (event.key === "#") {
          event.preventDefault()
          let currentLine = this.file.contents[this.currentLine]
          if (currentLine.type=='body') {
            currentLine.type = 'h1'
          }
          else if (currentLine.type.startsWith('h')) {
            let type = currentLine.type
            let num = parseInt(type.slice(1, type.length))

            if (num<6) {
              currentLine.type = 'h'+(num + 1)
            }
            else {
              currentLine.type = 'body'
            }
          }

          this.$emit('saveContents')
        }
        else if (event.key === ' ') {
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
      }
      else {
        event.preventDefault()

        if (event.key=='Backspace') {
          console.log('Delete')
          const sel = window.getSelection();
          const range = sel.getRangeAt(0);
          const firstLine = range.startContainer;
          const lastLine = range.endContainer;
          const firstLineIndex = range.startOffset + selectedLines[0].innerText.length - firstLine.length;
          const lastLineIndex = range.endOffset + selectedLines[selectedLines.length-1].innerText.length - lastLine.length;

          let lastLineText = selectedLines[selectedLines.length-1].innerText.slice(lastLineIndex)

          let newText = selectedLines[0].innerText.slice(0, firstLineIndex) + lastLineText

          this.currentLine = parseInt(selectedLines[0].getAttribute('data-num'))

          selectedLines[0].innerText = newText

          for (let i=1; i<selectedLines.length; i++) {
            console.log(document.querySelector('div[data-num="'+(this.currentLine+i)+'"]'))
            EventBus.$emit('removeLine', this.currentLine+i)
          }

          sel.removeAllRanges()
        }
        else if (event.key=='Enter') {
          console.log('New line replace')
        }
        else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') {
          console.log('Paste')
        }
        else {
          console.log('Replace')
        }
      }
    },

    lineClick(event) {
      event.preventDefault()
      if (this.file.contents.length==0) {
        let newLine = new Line()
        EventBus.$emit('appendLine', 0, newLine)

        this.$nextTick(()=>{
          const newTarget = document.querySelector('div[data-num="0"]')
          placeCaretAtEnd(newTarget)
        })

        this.currentLine = 0

        this.$emit('saveContents')
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
          
          const rect = document.getElementById('text').getBoundingClientRect();

          concept.x = circle*80*Math.cos(angle) + rect.width/2
          concept.y = circle*80*Math.sin(angle) + rect.height/2

        EventBus.$emit('addItem', concept)

        this.parseConcepts(this.$refs.lineContents)
      }
    },
  },

  computed: {
  },

  mounted() {
    const lineContents = this.$refs.lineContents;

    if (lineContents) {
      this.parseConcepts(lineContents)
      this.parseFunctions(lineContents)
    }
  },
}
</script>

<style scoped>
  
#text {
  height: 100%;
  width: 100h;
  position: relative;
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
  background: var(--v-error-base);
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
  display: flex;
  align-items: center;
  color: #fff;
}
.line-contents {
  flex: 1;
  outline: none;
  cursor: text;
  white-space: nowrap;
  color: #eee;
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
.h1 {
  font-size: 48px;
  font-weight: 500;
}
.h2 {
  font-size: 43px;
  font-weight: 500;
}
.h3 {
  font-size: 38px;
  font-weight: 500;
}
.h4 {
  font-size: 33px;
  font-weight: 500;
}
.h5 {
  font-size: 28px;
  font-weight: 500;
}
.h6 {
  font-size: 23px;
  font-weight: 500;
}
</style>
