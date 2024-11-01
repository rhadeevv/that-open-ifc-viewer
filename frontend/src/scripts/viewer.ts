import * as OBC from "@thatopen/components";
import { LogLevel } from "web-ifc";
import Stats from "stats.js";

// Variable untuk container viewer
const container = document.getElementById("container") as HTMLDivElement;
// const loadingIndicator = document.getElementById("loading") as HTMLDivElement;

// Create instance for thatopen-components
const components = new OBC.Components();

const fragments = new OBC.FragmentsManager(components);
const fragmentIfcLoader = new OBC.IfcLoader(components);

// Create worlds from components instance
const worlds = components.get(OBC.Worlds);
const world = worlds.create<
    OBC.SimpleScene,
    OBC.OrthoPerspectiveCamera,
    OBC.SimpleRenderer
>();

world.scene = new OBC.SimpleScene(components);
world.renderer = new OBC.SimpleRenderer(components, container);
world.camera = new OBC.OrthoPerspectiveCamera(components);

components.init();

world.scene.setup();

const grids = components.get(OBC.Grids);
grids.create(world);

world.scene.three.background = null;

// Setup stats.js
const stats = new Stats();
stats.showPanel(2); // 0: fps, 1: ms, 2: memory
document.body.appendChild(stats.dom);

// Function to update stats
function updateStats() {
    stats.begin();
    // monitored code here
    stats.end();
    requestAnimationFrame(updateStats);
}

// Start the stats update loop
requestAnimationFrame(updateStats);

async function setupLoader() {
    // loadingIndicator.style.display = "block";
    await fragmentIfcLoader.setup();

    fragmentIfcLoader.settings.wasm = {
        path: "https://unpkg.com/web-ifc@0.0.59/",
        absolute: true,
        logLevel: LogLevel.LOG_LEVEL_ERROR,
    };

    fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;

    const filename = new URLSearchParams(window.location.search).get(
        "filename"
    );
    if (filename) {
        await loadIfc(filename);
    } else {
        console.error("Filename not found on URL.");
        // loadingIndicator.style.display = "none"; // Hide loading indicator
    }
}

async function loadIfc(filename: string) {
    // const fileUrl = `${import.meta.env.VITE_BASE_URL}/api/ifc/files/${filename}`;
    const fileUrl = `http://localhost:3000/api/ifc/files/${filename}`;

    try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error("Load failed file IFC: " + response.statusText);
        }

        const data = await response.arrayBuffer();
        const buffer = new Uint8Array(data);

        const model = await fragmentIfcLoader.load(buffer);

        world.scene.three.add(model);
    } catch (err) {
        console.error("Error loading IFC file:", err);
    } finally {
        // Hide loading indicator after IFC is loaded
        // loadingIndicator.style.display = "none";
    }
}

setupLoader();

fragments.onFragmentsLoaded.add((model) => {
    console.log(model);
});
