console.log("[DBRP] INDEX LOADED");

import DiscordBetterRichPresenceBar from "./DiscordBetterRichPresenceBar";

export default {
    onLoad() {
        console.log("[DBRP] ONLOAD");
        DiscordBetterRichPresenceBar.start();
    },

    onUnload() {
        console.log("[DBRP] ONUNLOAD");
        DiscordBetterRichPresenceBar.stop();
    },
};
