import { logger } from "@vendetta";

import DiscordBetterRichPresenceBar from "./DiscordBetterRichPresenceBar";

export default {
    onLoad: () => {
        logger.log("[ DiscordBetterRichPresenceBar ]: Plugin loading");
        DiscordBetterRichPresenceBar.start()
    },

    onUnload: () => {
        logger.log("[ DiscordBetterRichPresenceBar ]: Plugin unloading");
        DiscordBetterRichPresenceBar.stop();
    },
};
