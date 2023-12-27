import type { App } from "vue";
import CytoscapeViewer from "./components/CytoscapeViewer.vue";
import {CytoUtils} from "./cytoUtils";

export default {
    install: (app: App) => {
        app.component("CytoscapeViewer", CytoscapeViewer);
    },
};

export { CytoscapeViewer, CytoUtils };
