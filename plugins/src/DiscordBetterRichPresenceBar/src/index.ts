import { patcher } from "@vendetta";
import { findByTypeName, findInReactTree } from "@vendetta/metro";
import { logger } from "@vendetta";

let unpatches: Function[] = [];

export default {
    onLoad: () => {
        logger.log("[DEBUG] Plugin załadowany");

        const UserProfileContent = findByTypeName("UserProfileContent");
        if (!UserProfileContent) {
            logger.log("[DEBUG] UserProfileContent nie znaleziony");
            return;
        }
        logger.log("[DEBUG] UserProfileContent znaleziony:", UserProfileContent);

        unpatches.push(
            patcher.after("type", UserProfileContent, (_, res) => {
                logger.log("[DEBUG] UserProfileContent render - res:", res);

                // Szukamy PrimaryInfo
                const primaryInfo = findInReactTree(res, c => c?.type?.name === "PrimaryInfo");
                if (!primaryInfo) {
                    logger.log("[DEBUG] PrimaryInfo nie znaleziony");
                } else {
                    logger.log("[DEBUG] PrimaryInfo znaleziony:", primaryInfo);
                }

                // Szukamy Activity
                const activity = findInReactTree(res, c => c?.type?.name === "Activity");
                if (!activity) {
                    logger.log("[DEBUG] Activity NIE znalezione w tym profilu");
                } else {
                    logger.log("[DEBUG] Activity znalezione:", activity);
                }

                return res;
            })
        );
    },

    onUnload: () => {
        logger.log("[DEBUG] Plugin odładowany, usuwanie patchy");
        unpatches.forEach(u => u());
        unpatches = [];
    }
};
