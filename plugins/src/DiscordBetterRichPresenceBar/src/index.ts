import { patcher } from "@vendetta";
import { findByTypeName, findInReactTree } from "@vendetta/metro";

let unpatches: Function[] = [];

export default {
    onLoad: () => {
        console.log("[DEBUG] Plugin załadowany");

        const UserProfileContent = findByTypeName("UserProfileContent");
        if (!UserProfileContent) {
            console.log("[DEBUG] UserProfileContent nie znaleziony");
            return;
        }
        console.log("[DEBUG] UserProfileContent znaleziony:", UserProfileContent);

        unpatches.push(
            patcher.after("type", UserProfileContent, (_, res) => {
                console.log("[DEBUG] UserProfileContent render - res:", res);

                // Szukamy PrimaryInfo
                const primaryInfo = findInReactTree(res, c => c?.type?.name === "PrimaryInfo");
                if (!primaryInfo) {
                    console.log("[DEBUG] PrimaryInfo nie znaleziony");
                } else {
                    console.log("[DEBUG] PrimaryInfo znaleziony:", primaryInfo);
                }

                // Szukamy Activity
                const activity = findInReactTree(res, c => c?.type?.name === "Activity");
                if (!activity) {
                    console.log("[DEBUG] Activity NIE znalezione w tym profilu");
                } else {
                    console.log("[DEBUG] Activity znalezione:", activity);
                }

                return res;
            })
        );
    },

    onUnload: () => {
        console.log("[DEBUG] Plugin odładowany, usuwanie patchy");
        unpatches.forEach(u => u());
        unpatches = [];
    }
};
