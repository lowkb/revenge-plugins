
import { patcher } from "@vendetta";
import { findByTypeName } from "@vendetta/metro";

let unpatches: (() => void)[] = [];

export default {
    start() {
        const UserProfileContent = findByTypeName("UserProfileContent");

        console.log("[DBRP] UserProfileContent:", UserProfileContent);

        if (!UserProfileContent) {
            console.log("[DBRP] UserProfileContent not found");
            return;
        }

        unpatches.push(
            patcher.after("type", UserProfileContent, (args, res) => {
                console.log("[DBRP] ===== UserProfileContent =====");
                console.log("[DBRP] args:", args);
                console.log("[DBRP] result:", res);
                console.log("[DBRP] result keys:", res ? Object.keys(res) : null);
            }),
        );
    },

    stop() {
        for (const unpatch of unpatches) {
            unpatch();
        }

        unpatches = [];
    },
};
