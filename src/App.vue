<script setup lang="ts">

import {ref, onMounted} from "vue";
import {IGraphView} from "@orbifold/utils";

const viewer = ref(null)
let cy: IGraphView;
onMounted(() => {
  cy = <IGraphView>viewer.value;
})

function loadSomething() {
  const g = {
    nodes: [
      {id: 'a', name: 'A'},
      {id: 'b'},
      {id: 'c'},
      {id: 'd'},
      {id: 'e'}
    ],
    edges: [
      {sourceId: 'a', targetId: 'e', name: 'A to E'},

    ]
  };
  cy.loadGraph(g)
  cy.setStyle("schema")
}
</script>

<template>
  <div id="toolbar">
    <button @click="loadSomething()">Sample Graph</button>
  </div>
  <div class="wrapper">
    <CytoscapeViewer class="cytoscape" ref="viewer"/>
  </div>


</template>

<style scoped>
.wrapper {
  height: 90vh;
  width: 90vw;
  position: relative;
  border: 1px solid silver;
  border-radius: 5px;
}

.cytoscape {
  height: 100vh;
  width: 100vw;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
