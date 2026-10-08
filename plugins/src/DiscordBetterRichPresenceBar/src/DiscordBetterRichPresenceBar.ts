import { before } from "@vendetta/patcher";
import { findByTypeName } from "@vendetta/metro/common";

class DiscordBetterRichPresenceBar {
    private patches: (() => void)[] = [];

    start() {
        this.inspectUserProfileContent();
    }

    stop() {
        for (const unpatch of this.patches) {
            unpatch();
        }

        this.patches = [];
    }

    private inspectUserProfileContent() {
        const UserProfileContent = findByTypeName("UserProfileContent");

        console.log("[DBRP] UserProfileContent:", UserProfileContent);

        if (!UserProfileContent) {
            console.log("[DBRP] UserProfileContent not found");
            return;
        }

        const unpatch = before(
            UserProfileContent,
            "render",
            (_, args) => {
                console.log("[DBRP] UserProfileContent props:", args?.[0]);
            },
        );

        this.patches.push(unpatch);
    }
}

export default new DiscordBetterRichPresenceBar();
