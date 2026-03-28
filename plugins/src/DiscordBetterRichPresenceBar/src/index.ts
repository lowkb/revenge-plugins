import { logger } from "@vendetta";
import ViewComponent from "./patches/ViewComponent";

let unpatch = null;
const patches = [
        [ViewComponent, []]
];
const patcher = () => patches.forEach(([fn, args]) => fn(...args));

export default {
        onLoad: async () => {

                
                try {
                        unpatch = patcher();
                }
                catch(err) {
                        logger.info(`${pluginNameToast} Crash On Load.\n\n`, err)
                        showToast(`${pluginNameToast} Crashing On Load. Please check debug log for more info.`)
                        stopPlugin(id)                
                }
        },
        onUnload: () => {

        unpatch?.()
        // stopPlugin(id)
    }
}
