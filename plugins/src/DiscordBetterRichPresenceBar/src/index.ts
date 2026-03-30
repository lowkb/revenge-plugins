import { logger, showToast, stopPlugin } from "@vendetta";
import ViewComponent from "./patches/ViewComponent";

let unpatch = null;

const patches = [
    [ViewComponent, []]
];

const patcher = () => {
    logger.info("[DiscordBetterRichPresenceBar] Initializing patcher...");

    const unpatches = patches.map(([fn, args], index) => {
        try {
            logger.info(`[DiscordBetterRichPresenceBar] Applying patch #${index} -> ${fn.name}`);
            const result = fn(...args);

            if (typeof result !== "function") {
                logger.warn(`[DiscordBetterRichPresenceBar] Patch #${index} did not return unpatch function`);
            } else {
                logger.info(`[DiscordBetterRichPresenceBar] Patch #${index} applied successfully`);
            }

            return result;
        } catch (err) {
            logger.error(`[DiscordBetterRichPresenceBar] Error while applying patch #${index}`, err);
            return null;
        }
    });

    return () => {
        logger.info("[DiscordBetterRichPresenceBar] Running unpatch cleanup...");

        unpatches.forEach((u, index) => {
            try {
                if (typeof u === "function") {
                    logger.info(`[DiscordBetterRichPresenceBar] Unpatching #${index}`);
                    u();
                } else {
                    logger.warn(`[DiscordBetterRichPresenceBar] No unpatch function for #${index}`);
                }
            } catch (err) {
                logger.error(`[DiscordBetterRichPresenceBar] Error while unpatching #${index}`, err);
            }
        });

        logger.info("[DiscordBetterRichPresenceBar] Cleanup finished");
    };
};

export default {
    onLoad: async () => {
        try {
            logger.info("[DiscordBetterRichPresenceBar] onLoad triggered");

            unpatch = patcher();

            if (typeof unpatch !== "function") {
                logger.error("[DiscordBetterRichPresenceBar] Patcher did not return a function");
                throw new Error("Invalid unpatch function");
            }

            logger.info("[DiscordBetterRichPresenceBar] Plugin loaded successfully");
        } catch (err) {
            logger.error("[DiscordBetterRichPresenceBar] Failed to load plugin", err);
            showToast("Failed to load DiscordBetterRichPresenceBar");
            stopPlugin();
        }
    },

    onUnload: () => {
        try {
            logger.info("[DiscordBetterRichPresenceBar] onUnload triggered");

            unpatch?.();

            logger.info("[DiscordBetterRichPresenceBar] Plugin unloaded successfully");
        } catch (err) {
            logger.error("[DiscordBetterRichPresenceBar] Error during unload", err);
        }
    }
};
