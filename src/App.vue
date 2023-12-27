<script setup lang="ts">

import {ref, onMounted} from "vue";
const viewer = ref(null)

onMounted(() => {
  ( <unknown>viewer.value).addNode({id:"a", name:"Swa"})
})
</script>

<template>

<GraphViewer class="cytoscape" ref="viewer"/>

</template>

<style scoped>
  .cytoscape {
    height: 100vh;
    width: 100vw;
    position: absolute;
    top: 0;
    left: 0;
  }
</style>
