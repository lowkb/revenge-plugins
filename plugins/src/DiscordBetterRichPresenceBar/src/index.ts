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
        try {
            unpatch = patcher();
            logger.info("Plugin loaded successfully.");
        } catch(err) {
            logger.info("Plugin crash on load\n\n", err);
            showToast("Plugin crashed on load. Check debug log.");
            stopPlugin("pluginId"); // zamień "pluginId" na id pluginu
        }
    },
    onUnload: () => {
        unpatch?.();
        logger.info("Plugin unloaded.");
    }
};
