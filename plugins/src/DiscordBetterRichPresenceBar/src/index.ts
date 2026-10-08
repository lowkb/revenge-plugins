import DiscordBetterRichPresenceBar from "./DiscordBetterRichPresenceBar";

export default { //hehe
    onLoad() {
        console.log("[DBRP] ONLOAD");
        DiscordBetterRichPresenceBar.start();
    },

    onUnload() {
        console.log("[DBRP] ONUNLOAD");
        DiscordBetterRichPresenceBar.stop();
    },
};
