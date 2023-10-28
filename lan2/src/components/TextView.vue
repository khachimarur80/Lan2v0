<template>
  <v-container>
    <TextEditor
      :concepts="concepts"
      :relations="relations"
      :categories="categories"
      :contents="contents"
      @addItem="addItem"
      @updateContents="updateContents"
    ></TextEditor>
  </v-container>
</template>

<script>

import EventBus from '@/event-bus'
import TextEditor from './TextEditor';

export default {
  name: 'TextView',

  data: () => ({
  }),

  components: {
    TextEditor
  },

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
    addItem(concept) {
      EventBus.$emit('addItem', concept)
    },
    updateContents(contents) {
      EventBus.$emit('updateContents', contents)
    }
  },

  computed: {
  },

  created() {
    this.lines = this.contents
  },

  mounted() {
    const lineContents = this.$refs.lineContents;

    if (lineContents) {
      for (let i=0; i<lineContents.length; i++) {
        let words = lineContents[i].textContent.split(' ')
        words = Array.from(new Set(words)).filter(word => word.trim() !== '')
        for (let j=0; j<words.length; j++) {
          let concept = this.concepts.find(concept => concept.name==words[j].trim())
          if (concept) {
            let word = words[j].trim();
            let regex = new RegExp(`\\b${word}\\b`, 'g');

            lineContents[i].innerHTML = this.lines[i].contents.replace(regex, `<span contenteditable="false" class="inline-concept">${word}</span>`);

            if (j==(words.length-1)) {
              lineContents[i].innerHTML += '&nbsp;'
            } 
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
  display: flex;
  align-items: center;
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
