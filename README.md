# Qwiery Vue Cytoscape Component

Install with `npm install @orbifold/vue-cytoscape --save`

and in a Vue application use something like this:

```vue
<script setup lang="ts">

import {ref, onMounted} from "vue";
const viewer = ref(null)

onMounted(() => {
  ( <any>viewer.value).addNode({id:"a", name:"Swa"})
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


```

In a Nuxt application create a plugin file with the following content:

```TypeScript
import Cyto from "@orbifold/vue-cytoscape";
import { CytoUtils } from "@orbifold/vue-cytoscape";
export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.use(Cyto);
	return {
		provide: {
			cyto: CytoUtils,
		},
	};
});

```

This will allow you to use the component and the utils in any page or code:

```vue
<template>
	<CytoscapeViewer class="cytoscape" ref="viewer" />
</template>
<script setup lang="ts">
	import { onMounted, ref } from "vue";
	import { Graph } from "@orbifold/graphs";
	const viewer = ref(null);
	const { $cyto } = useNuxtApp();
	onMounted(() => {
		const cy = <any>viewer.value;
		const g = Graph.create("erdos");
		cy.loadGraph(g);
		cy.layout();
		console.log($cyto.isCytoEdge({}));
	});
</script>
<style>
	.cytoscape {
		height: 100vh;
		width: 100vw;
		position: absolute;
		top: 0;
		left: 0;
	}
</style>

```
