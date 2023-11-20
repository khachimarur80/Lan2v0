<template>
  <div id="functions" class="pa-9">
    <v-card height="100%" width="100%" flat outlined style="background: #121212; border-radius: 0px;" class="px-2 pt-2 overflow-auto">
      <v-autocomplete
        color="error"
        v-model="select"
        :items="relations"
        item-value="id"
        :cache-items="false"
        flat
        hide-no-data
        hide-details
        dense
        label="Search for a function"
        outlined
        item-text="name"
        @change="selectItem">
        <template v-slot:item="{ item }">
          <div color="red">{{ item.name }}</div>
        </template>
      </v-autocomplete>
      <v-divider class="my-2"></v-divider>
      <v-card-title class="text-h3 text-center" v-if="selectedQuery">
        {{ selectedQuery.name }}
      </v-card-title>
      <v-card-text v-if="selectedQuery">
        <div class="text-h6">
          Instances
        </div>
        <v-divider></v-divider><br>
        <div class="text-body-1">Object : {{ getObjectById(selectedQuery.object).name }}</div>
        <div class="text-body-1">Subject : {{ getObjectById(selectedQuery.subject).name }}</div>
        <br><div class="text-h6">
          Result
        </div>
        <v-divider></v-divider><br>
        <v-text-field 
          outlined
          v-for="(sentence, i) in selectedQuery.sentences" :key="i"
          @keydown.enter="addOutput(i)"
          @keydown.backspace="removeOutput(i)"
          @input="updateSentence(i)"
          autofocus
          dense
          hide-details
          hide-no-data
          class="py-1"
          :data-id="i"
          :value="sentence"
          color="error"
          >
        </v-text-field>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>

  import EventBus from '@/event-bus.js';

  export default {
    name: 'FunctionsView',

    data: () => ({
      select: null,
      selectedQuery: null,
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
    },

    methods: {
      updateSentence(index) {
        EventBus.$emit('modifySentenceFromFunction', this.selectedQuery, index, document.querySelector("[data-id='"+(index)+"']").value)
      },
      addOutput(index) {
        EventBus.$emit('addSentenceToFunction', this.selectedQuery, index)
      },
      removeOutput(index) {
        if (this.selectedQuery.sentences.length > 1) {
          EventBus.$emit('removeSentenceFromFunction', this.selectedQuery, index)
          document.querySelector("[data-id='"+(index-1)+"']").focus()
        }
      },
      getObjectById(id) {
        for(let i=0; i<this.relations.length; i++) {
          if (this.relations[i].id==id) {
            return this.relations[i]
          }
        }
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
      },
      saveData() {
        EventBus.$emit('saveData')
      },
      selectItem() {
        this.selectedQuery = this.getObjectById(this.select)
        console.log(1)
        this.select = null
      },

    },

    computed: {
      
    },

    created() {
      
    }
  }
</script>
<style scoped>
  #functions {
    height: calc(100% - 40px);
    width: 100h;
    position: relative;
    overflow: scroll;
  }
</style>
