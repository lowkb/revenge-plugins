import DiscordBetterRichPresenceBar from "./DiscordBetterRichPresenceBar";

export default {
    onLoad() {
        DiscordBetterRichPresenceBar.start();
    },

    onUnload() {
        DiscordBetterRichPresenceBar.stop();
    },
};
