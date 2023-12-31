<template>
	<div id="cy"></div>
</template>
<script setup lang="ts">
	/*
	 * Cytoscape IGraphView implementation.
	 * */
	import { onMounted } from "vue";
	import cytoscape, { Stylesheet } from "cytoscape"; // https://js.cytoscape.org/
	import _ from "lodash";
	import cola from "cytoscape-cola"; // https://github.com/cytoscape/cytoscape.js-cola
	import defaultStyle from "./styles/defaultStyle.json";
	import schemaStyle from "./styles/schemaStyle.json";
	import edgehandles from "cytoscape-edgehandles";
	import type { IQwieryEdge, IQwieryNode, IGraphView, GraphLike } from "@orbifold/utils";
	import { Utils } from "@orbifold/utils";
	import { CytoUtils } from "../cytoUtils"; // https://github.com/cytoscape/cytoscape.js-edgehandles
	let selectionDebounceTimeout: any = null;
	cytoscape.use(edgehandles);
	cytoscape.use(cola);
	let currentPosition: any = { x: 0, y: 0 };
	let cy: cytoscape.Core;
	let edgeCreator: any = null;
	let nodeCreationEnabled = false
	let edgeCreationEnabled = false;

	const emit = defineEmits<{
		(e: "selectionChanged", selection: any[]): void;
		(e: "doubleClick", id: string): void;
		(e: "createNode", node: any): void;
	}>();
	onMounted(() => {
		cy = cytoscape({
			container: document.getElementById("cy"),
			style: <Stylesheet[]>(<unknown>defaultStyle),
		});
		addEventHandlers();
		// for debugging
		window["cy"] = cy;

		let edgeHandlesDefaults = {
			canConnect: function(sourceNode, targetNode) {
				// whether an edge can be created between source and target
				return !sourceNode.same(targetNode); // e.g. disallow loops
			},
			edgeParams: function(sourceNode, targetNode) {
				// for edges between the specified source and target
				// return element object to be passed to cy.add() for edge
				return {};
			},
			hoverDelay: 150, // time spent hovering over a target node before it is considered selected
			snap: true, // when enabled, the edge can be drawn by just moving close to a target node (can be confusing on compound graphs)
			snapThreshold: 50, // the target node must be less than or equal to this many pixels away from the cursor/finger
			snapFrequency: 15, // the number of times per second (Hz) that snap checks done (lower is less expensive)
			noEdgeEventsInDraw: true, // set events:no to edges during draws, prevents mouseouts on compounds
			disableBrowserGestures: true, // during an edge drawing gesture, disable browser gestures such as two-finger trackpad swipe and pinch-to-zoom
		};

		edgeCreator = cy.edgehandles(edgeHandlesDefaults);
	});

	function addNode(node: IQwieryNode) {
		const cyNode = CytoUtils.toCyNode(node);
		cy.add(cyNode);
		return cyNode.data.id;
	}

	function addEdge(edge: IQwieryEdge) {
		const cyEdge = CytoUtils.toCyEdge(edge);
		cy.add([
			{
				id: cyEdge.id,
				group: "edges",
				data: cyEdge.data,
				source: cyEdge.sourceId,
				target: cyEdge.targetId,
			},
		]);
	}

	function removeSelection() {
		return cy.$(":selected").remove();
	}



	function loadGraph(g: GraphLike | any, replace: boolean = true) {
		// if (_.isPlainObject(g)) {
		// 	if (g.typeName === "Graph") {
		// 		g = Graph.fromJSON(g);
		// 	} else {
		// 		throw new Error("Right now only supporting a Graph.");
		// 	}
		// }
		if (replace) {
			clear();
		}
		cy.json({ elements: CytoUtils.toElements(g) });
		layout();
		// console.log(cy.nodes().map((n) => n.id()));
	}

	function clear() {
		cy.elements().remove();
	}

	function setStyle(styleName: string) {
		if (styleName) {
			switch (styleName.toString().trim().toLowerCase()) {
				case "default":
					cy.style(<Stylesheet[]>defaultStyle);
					break;
				case "schema":
					cy.style(<Stylesheet[]>schemaStyle);
					break;
			}
		}
	}

	/**
	 * Apply the layout with the name and options.
	 * @see Part of the {@link IGraphView} interface.
	 * @param layoutName {string} The name of the layout.
	 * @param [options] {any} Options specific to the layout.
	 */
	function layout(layoutName: string = "organic", options: any = {}) {
		switch (layoutName.toLowerCase()) {
			case "organic":
				organicLayout(options);
				break;
			case "hierarchical":
				hierarchicalLayout(options);
				break;
			case "concentric":
				concentricLayout(options);
				break;
			default:
				return new Error(`The layout type '${layoutName}' is not handled or not supported.`);
		}
		fit();
	}

	/**
	 * Centers the graph in the canvas.
	 * @see Part of the {@link IGraphView} interface.
	 * @param [shouldFit] {boolean} Whether to resize so it fits in the cureent view.
	 */
	function center(shouldFit: boolean = true) {
		if (shouldFit) {
			fit();
		} else {
			cy.centre();
		}
	}

	function centerNode(node: IQwieryNode) {
		const cyNode = getNode(node.id);
		cy.center(cyNode);
	}

	function fit(padding: number = 20) {
		cy.fit(cy.elements(), padding);
	}

	function zoom(factor: number | null = null) {
		if (factor) {
			cy.zoom(factor);
		}
		return cy.zoom();
	}

	/**
	 * Classic organic layout based on the Cola package.
	 * @see https://github.com/cytoscape/cytoscape.js-cola
	 * @param options
	 */
	function organicLayout(options = {}) {
		const layout = cy.layout(<any>{
			name: "cola",
			nodeSpacing: 58,
			padding: 80,
			randomize: true,
			maxSimulationTime: 6000,
		});
		layout.run();
	}

	function hierarchicalLayout(options = {}) {
		const layout = cy.layout(<any>{
			name: "breadthfirst",
		});
		layout.run();
	}

	function concentricLayout(options = {}) {
		const layout = cy.layout(<any>{
			name: "concentric",
		});
		layout.run();
	}

	function removeNode(id: string | any) {
		if (!Utils.isEmpty(id)) {
			if (_.isString(id)) {
				cy.remove(cy.getElementById(id));
			} else {
				cy.remove(id);
			}
		}
	}
	function removeEdge(id: string | any) {
		if (!Utils.isEmpty(id)) {
			if (_.isString(id)) {
				cy.remove(cy.getElementById(id));
			} else {
				cy.remove(id);
			}
		}
	}

	function getNodes(filter: Function | null = null): IQwieryNode[] {
		let found = [];
		if (filter) {
			found = cy.nodes().filter((element: any, i: number, elements: any[]) => filter(element, i, elements));
		} else {
			found = cy.nodes();
		}
		return CytoUtils.toPlain(found.toArray());
	}

	function getEdges(filter: Function | null = null): IQwieryNode[] {
		let found = [];
		if (filter) {
			found = cy.edges().filter((element: any, i: number, elements: any[]) => filter(element, i, elements));
		} else {
			found = cy.edges();
		}
		return CytoUtils.toPlain(found.toArray());
	}

	function removeIsolatedNodes() {
		const singletons = cy.nodes().filter((element: any, i: number, elements: any[]) => element.degree() === 0);
		cy.remove(singletons);
	}

	function edgeCreation(enabled: boolean = true) {
		if (enabled) {
			edgeCreator.enable();
			edgeCreator.enableDrawMode();
		} else {
			edgeCreator.disable();
			edgeCreator.disableDrawMode();
		}
		edgeCreationEnabled = enabled;
	}

	function nodeCreation(enabled: boolean = true) {
		nodeCreationEnabled = enabled;
	}

	/**
	 *
	 * @returns {IQwieryNode[]}
	 */
	function selectedNodes(): IQwieryNode[] {
		const selection = cy.elements(":selected");
		return CytoUtils.toPlain(selection.toArray());
	}

	function addEventHandlers() {
		cy.on("mousemove", function(e) {
			currentPosition = e.position;
		});
		cy.on("dbltap", "node", function(e) {
			emit("doubleClick", e.target.data("id"));
		});
		cy.on("dbltap", function(e) {
			const evtTarget = e.target;
			if (!nodeCreationEnabled) {
				if (evtTarget === cy) {
					emit("createNode", {
						id: Utils.id(),
						x: e.position.x,
						y: e.position.y,
					});
				} else {
					console.log("Clicked " + evtTarget.id());
				}
			}
		});

		cy.on("tap", function(e) {
			if (nodeCreationEnabled) {
				const evtTarget = e.target;
				if (evtTarget === cy) {
					emit("createNode", {
						id: Utils.id(),
						x: e.position.x,
						y: e.position.y,
					});
				} else {
					console.log("Clicked " + evtTarget.id());
				}
			} else {
				const evtTarget = e.target;
				if (evtTarget === cy) {
					// CTRL-click adds a node
					if (e.originalEvent.ctrlKey) {
						cy.add({
							group: "nodes",
							data: { id: Utils.id() },
							position: e.position,
						});
					}
				} else {
					// if (evtTarget.isNode()) {
					// 	if (e.originalEvent.ctrlKey) {
					// 		edgeCreator?.enable();
					// 		edgeCreator?.start(evtTarget.first());
					// 		// console.log("Node drag");
					// 		e.preventDefault();
					// 	}
					// }
				}
			}
		});
		cy.on("ehstop", (e) => {
			if (!edgeCreationEnabled) {
				edgeCreator?.disable();
				cy.nodes().unlock();
			}
		});
		cy.on("select", "node", function(e) {
			// debounce
			if (selectionDebounceTimeout) {
				clearTimeout(selectionDebounceTimeout);
			}
			selectionDebounceTimeout = setTimeout(function() {
				const selection = selectedNodes();
				emit("selectionChanged", selection);
			}, 200);
		});
		cy.on("unselect", "node", function(e) {
			if (selectionDebounceTimeout) {
				clearTimeout(selectionDebounceTimeout);
			}
			selectionDebounceTimeout = setTimeout(function() {
				const selection = selectedNodes();
				emit("selectionChanged", selection);
			}, 200);
		});

		// cy.on("drag", (e) => {
		// 	e.preventDefault();
		// });
		cy.on("tapdrag", (e) => {
			const evtTarget = e.target;
			if (evtTarget !== cy) {
				if (evtTarget.isNode()) {
					const node = evtTarget.first();
					if (e.originalEvent.ctrlKey) {
						edgeCreator?.enable();
						cy.nodes().lock();
						edgeCreator?.start(node);
						// console.log("Node drag");
						e.preventDefault();
					}
				}
			}
		});
	}

	function getPosition() {
		return currentPosition;
	}

	function getNode(id: string) {
		const found = cy.getElementById(id);
		if (found.size() > 0 && found[0].isNode()) {
			return found.first();
		} else {
			return null;
		}
	}

	function getEdge(id: string) {
		const found = cy.getElementById(id);
		if (found.size() > 0 && found[0].isEdge()) {
			return found.first();
		} else {
			return null;
		}
	}

	function setNodeProperty(id, name, value) {
		const node = getNode(id);
		if (node) {
			node.data(name, value);
		}
	}

	function setNodeProperties(id, data) {
		const node = getNode(id);
		if (node) {
			node.data(data);
		}
	}

	function refreshStyle() {
		cy.nodes().updateStyle();
	}

	function forceResize() {
		cy.resize();
		cy.fit();
	}

	/**
	 * Augment the current graph with the nodes and edges of the given graph.
	 * @param g {GraphLike} The graph to augment with.
	 */
	function augment(g: GraphLike) {
		const coll: any[] = [];

		function pushNode(node) {
			const id = node.id;
			if (!cy.hasElementWithId(id)) {
				coll.push(CytoUtils.toCyNode(node));
			}
		}


		function pushEdge(edge) {
			// const id = edge.id;
			// if (!cy.hasElementWithId(id)) {
			// 	const e = CytoUtils.toCyEdge(edge);
			// 	// annoying that edges and nodes id's cannot overlap
			// 	e.id = Utils.id();
			// 	coll.push(e);
			// }
			const e = CytoUtils.toCyEdge(edge);
			// annoying that edges and nodes id's cannot overlap
			e.id = Utils.id();
			e.data.id = e.id;
			coll.push(e);
		}

		g.nodes.forEach((n) => {
			pushNode(n);
		});
		g.edges.forEach((e) => {
			pushEdge(e);
		});
		cy.add(coll);
		layout();
	}

	/**
	 * Expose the IGraphView interface.
	 *
	 * This Cytoscape wrapper implements the Qwiery `IGraphView` interface and it means you can transparently exchange it with other implementations.
	 * The [yFiles](https://github.com/Qwiery/qwiery-vue-yfiles) and [Linkurious Ogma](https://github.com/Qwiery/qwiery-vue-ogma) implementations are more advanced but are not free.
	 */
	defineExpose<IGraphView>({
		addEdge,
		addNode,
		augment,
		center,
		centerNode,
		clear,
		edgeCreation,
		fit,
		forceResize,
		getNode,
		getNodes,
		getEdges,
		getPosition,
		layout,
		loadGraph,
		nodeCreation,
		refreshStyle,
		removeIsolatedNodes,
		removeNode,
		removeEdge,
		removeSelection,
		selectedNodes,
		setNodeProperties,
		setNodeProperty,
		setStyle,
		zoom,
	});
</script>
<style scoped>
	#cy {
		z-index: 0;
		height: 85vh;
		width: 100%;
		background-color: transparent;
		outline: none;
	}
</style>
