import { logger, showToast, stopPlugin } from "@vendetta";
import ViewComponent from "./patches/ViewComponent";

let unpatch = null;

const patches = [
[ViewComponent, []]
];

const patcher = () => {
const unpatches = patches.map(([fn, args]) => fn(...args));
return () => unpatches.forEach(u => u?.());
};

export default {
onLoad: async () => {
unpatch = patcher();
logger.info("Plugin loaded successfully.");
},
onUnload: () => {
unpatch?.();
logger.info("Plugin unloaded.");
}
};

