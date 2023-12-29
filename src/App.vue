<template>
  <div class="toolbar">
    <button class="btn" @click="loadSomething()">Sample Graph</button>
    <button class="btn" @click="removeIsolated()">Drop Isolated</button>
  </div>
  <div class="wrapper">
    <CytoscapeViewer class="cytoscape" ref="viewer"/>
  </div>


</template>
<script setup lang="ts">

import {ref, onMounted} from "vue";
import {IGraphView} from "@orbifold/utils";

const viewer = ref(null)
let cy: IGraphView;
onMounted(() => {
  cy = <IGraphView><unknown>viewer.value;
})
function removeIsolated() {
  cy.removeIsolatedNodes()
}
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



<style scoped>
.wrapper {
  padding: 5px;
  height: 90vh;
  width: 90vw;
  position: relative;
  border: 1px solid silver;
  border-radius: 5px;
}
.toolbar{
  padding: 5px;
  width: 90vw;
  position: relative;
  border: 1px solid silver;
  border-radius: 5px;
  margin-bottom: 5px;
}
.cytoscape {
  height: 100vh;
  width: 100vw;
  position: absolute;
  top: 0;
  left: 0;
}
.btn{
  background-color: steelblue;
  color: white;
  border: none;
  padding: 5px;
  cursor: pointer;
  border-radius: 4px;
  margin-right: 5px;
}
</style>
