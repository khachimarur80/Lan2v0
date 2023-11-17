<template>
  <v-container>
    <TextEditor
      class="pa-9"
      v-if="file"
      :concepts="concepts"
      :relations="relations"
      :categories="categories"
      :file="file"

      @saveContents="saveContents"
    ></TextEditor>
    <div class="notFile" v-else>
      <v-icon x-large>
        mdi-folder-outline
      </v-icon>
    </div>
  </v-container>
</template>

<script>

import TextEditor from './TextEditor';
import EventBus from '@/event-bus.js';

export default {
  name: 'TextView',

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
    file: {
      required: true,
    }
  },

  methods: {
    saveContents() {
      let parsedContent = this.file.contents.map(obj => obj.contents).join('\n')
      EventBus.$emit('updateContents', parsedContent)
    },
    
  },

  computed: {
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
.notFile {
  height: calc(100vh - 40px - 30px - 20px);
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
