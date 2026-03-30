import { patcher } from "@vendetta";
import { findByTypeName, findInReactTree } from "@vendetta/metro";

let unpatches: Function[] = [];

export default {
    onLoad: () => {
        const UserProfileContent = findByTypeName("UserProfileContent");
        if (!UserProfileContent) return;

        unpatches.push(
            patcher.after("type", UserProfileContent, (_, res) => {
                // Szukamy komponentu Activity w drzewie Reacta
                const activity = findInReactTree(res, c => c?.type?.name === "Activity");
                if (activity) {
                    console.log("Activity znalezione:", activity);
                } else {
                    console.log("Activity NIE znalezione w tym profilu");
                }
                return res;
            })
        );
    },

    onUnload: () => {
        unpatches.forEach(u => u());
        unpatches = [];
    }
};
