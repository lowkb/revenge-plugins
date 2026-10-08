import { patcher } from "@vendetta";
import { findByTypeName } from "@vendetta/metro";

let unpatches: (() => void)[] = [];

console.log("[DBRP] FILE LOADED");

export default {
    start() {
        console.log("[DBRP] START CALLED");

        const UserProfileContent = findByTypeName("UserProfileContent");

        console.log("[DBRP] UserProfileContent:", UserProfileContent);

        if (!UserProfileContent) {
            console.log("[DBRP] UserProfileContent NOT FOUND");
            return;
        }

        unpatches.push(
            patcher.after(
                "type",
                UserProfileContent,
                (args, res) => {
                    console.log("[DBRP] ===== UserProfileContent =====");
                    console.log("[DBRP] args:", args);
                    console.log("[DBRP] result:", res);

                    if (res) {
                        console.log(
                            "[DBRP] result keys:",
                            Object.keys(res),
                        );
                    }
                },
            ),
        );

        console.log("[DBRP] UserProfileContent patched");
    },

    stop() {
        console.log("[DBRP] STOP CALLED");

        for (const unpatch of unpatches) {
            try {
                unpatch();
            } catch (error) {
                console.log("[DBRP] Failed to unpatch:", error);
            }
        }

        unpatches = [];

        console.log("[DBRP] STOP COMPLETE");
    },
};
