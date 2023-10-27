<template>
  <div id="mermaid">
    <div class="mermaid">
      graph TD;
      A-->B;
      A-->C;
    </div>
  </div>
</template>

<script>
import mermaid from 'mermaid'

export default {
  name: 'MermaidView',

  data: () => ({
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
  },

  computed: {
  },

  created() {
    mermaid.initialize({
      startOnLoad: true,
    });

    mermaid.init();
  }
}
</script>

<style scoped>
#mermaid {
  height: calc(100vh - 80px);
  width: 100h;
  cursor: crosshair;
  position: relative;
  display: flex;
  gap: 20px;
  padding: 20px;
}
</style>
