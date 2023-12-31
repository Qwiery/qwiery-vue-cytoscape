<template>
	<div style="display: flex">
		<img src="https://qwiery.com/QwierySmall.png" alt="" style="width: 50px; margin: 0 0 10px 0">
		<h1>Cytoscape Viewer</h1></div>
	<p>Demonstrates how to use the graph view API. This API is also implemented around <a href="https://qwiery.com/graphviz/yfiles/" target="_blank">yFiles</a> and <a href="https://qwiery.com/graphviz/ogma/" target="_blank">Ogma</a>, see <a href="https://qwiery.com">Qwiery</a> for more into.</p>
	<div class="toolbar">
		<button class="btn" @click="loadSomething()">Sample Graph</button>
		<button class="btn" @click="removeIsolated()">Drop Isolated</button>
		<button class="btn" @click="addEdge()">Add Edge</button>
		<button class="btn" @click="removeEdge()">Remove Edge</button>
		<button class="btn" @click="addNode()">Add Node</button>
		<button class="btn" @click="removeNode()">Remove Node</button>
		<button class="btn" @click="clear()">Clear</button>
		<button class="btn" @click="augment()">Augment</button>
		<button class="btn" @click="center()">Center</button>
		<button class="btn" @click="zoomIn()">Zoom In</button>
		<button class="btn" @click="zoomOut()">Zoom Out</button>

		<div class="btn"><label for="edgeCreation">Edge Creation</label>
			<input id="edgeCreation" type="checkbox" @click="toggleEdgeCreation()"></div>

		<span style="margin-left: 20px;">Layout: </span>
		<button style="margin-left: 20px" class="btn cyan" @click="layout('concentric')">Concentric</button>
		<button class="btn cyan" @click="layout('organic')">Organic</button>
		<button class="btn cyan" @click="layout('hierarchical')">Hierarchical</button>
	</div>
	<div class="wrapper">
		<CytoscapeViewer class="cytoscape" ref="viewer" />
	</div>
</template>
<script setup lang="ts">

	import { ref, onMounted } from "vue";
	import { IGraphView, Utils } from "@orbifold/utils";
	import _ from "lodash";

	let edgeCreation = false;
	const viewer = ref(null);
	let cy: IGraphView;
	onMounted(() => {
		cy = <IGraphView><unknown>viewer.value;
	});

	function layout(name: string) {
		cy.layout(name);
	}
	function removeIsolated() {
		cy.removeIsolatedNodes();
	}

	function loadSomething() {
		const g = {
			nodes: [
				{ id: "a", name: "A" },
				{ id: "b", name: "B" },
				{ id: "c", name: "C" },
				{ id: "d", name: "D" },
				{ id: "e", name: "E" },
			],
			edges: [
				{ sourceId: "a", targetId: "e", name: "A to E" },

			],
		};
		cy.loadGraph(g);
		cy.setStyle("schema");
	}

	/**
	 * Add an edge between two random nodes
	 */
	function addEdge() {
		const ids = cy.getNodes().map(n => n.id);
		if (ids.length > 1) {
			const tuple = _.sampleSize(ids, 2);
			const sourceId = tuple[0];
			const targetId = tuple[1];
			cy.addEdge({ sourceId, targetId });
		}

	}

	/**
	 * Add a node at a random position
	 */
	function addNode() {
		cy.addNode({ id: Utils.id(), name: "New Node", x: window.innerWidth / 2 - 200 + Math.random() * 400, y: window.innerHeight / 2 - 200 + Math.random() * 400, color: "red" });
	}

	/**
	 * Toggle edge creation mode
	 */
	function toggleEdgeCreation() {
		if (edgeCreation) {
			cy.edgeCreation(false);
		} else {
			cy.edgeCreation(true);
		}
		edgeCreation = !edgeCreation;
	}

	/**
	 * Clears the graph.
	 */
	function clear() {
		cy.clear();
	}
	function center(){
		cy.center();
	}

	function augment() {
		const id1 = Utils.id(), id2 = Utils.id();
		cy.augment({
			nodes: [{
				id: id1,
			},
				{
					id: id2,
				}],
			edges: [
				{
					sourceId: id1,
					targetId: id2,
				},
			]
			,
		});
	}

	function removeEdge() {
		const edges = cy.getEdges();
		if (edges.length > 0) {
			const edge = _.sample(edges);
			cy.removeEdge(edge.id);
		}
	}

	function removeNode() {
		const nodes = cy.getNodes();
		if (nodes.length > 0) {
			const node = _.sample(nodes);
			cy.removeNode(node.id);
		}
	}
	function zoomIn() {
		cy.zoom(cy.zoom() + 0.1);
	}
	function zoomOut() {
		cy.zoom(cy.zoom() - 0.1);
	}
</script>


<style>
	a {
		text-decoration: none;
		color: steelblue;
		font-weight: bold;
	}

	.wrapper {
		padding: 5px;
		height: 80vh;
		width: 90vw;
		position: relative;
		border: 1px solid silver;
		border-radius: 5px;
	}

	.toolbar {
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

	.btn {
		display: inline;
		height: 30px;
		background-color: steelblue;
		color: white;
		border: none;
		padding: 5px;
		cursor: pointer;
		border-radius: 4px;
		margin-right: 5px;
	}
	.cyan{
		background-color: #3da8a8;
	}
</style>
