import { logger } from "@vendetta";
import { patchUserProfileContent } from "./patch/UserProfileContent";

let unpatches: (() => void)[] = [];

export default {
    onLoad: () => {
        logger.log("[RPC] Plugin loading...");

        unpatches.push(...patchUserProfileContent());

        logger.log("[RPC] Plugin loaded successfully");
    },

    onUnload: () => {
        logger.log("[RPC] Unloading plugin...");
        unpatches.forEach(u => u());
        unpatches = [];
        logger.log("[RPC] Plugin unloaded");
    }
};
