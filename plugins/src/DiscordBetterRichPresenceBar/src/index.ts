import { logger } from "@vendetta";
import ViewComponent from "./patches/ViewComponent";

let unpatch: (() => void) | null = null;

export default {
    onLoad() {
        unpatch = ViewComponent();
        logger.info("Plugin loaded successfully.");
    },
    onUnload() {
        unpatch?.();
        unpatch = null;
        logger.info("Plugin unloaded.");
    }
};
