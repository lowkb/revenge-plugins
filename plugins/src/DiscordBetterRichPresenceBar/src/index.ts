import { patcher } from "@vendetta";
import { findByTypeName, findInReactTree } from "@vendetta/metro";
import { logger } from "@vendetta";

let unpatches: Function[] = [];

export default {
    onLoad: () => {
        if (unpatches.length) return;

        logger.log("[DEBUG] Plugin załadowany");

        const UserProfileContent = findByTypeName("UserProfileContent");

        if (!UserProfileContent) {
            logger.log("[DEBUG] UserProfileContent nie znaleziony");
            return;
        }

        const Target =
            UserProfileContent.type?.type ??
            UserProfileContent.type ??
            UserProfileContent;

        if (!Target) {
            logger.log("[DEBUG] Nie udało się znaleźć targetu do patchowania");
            return;
        }

        unpatches.push(
            patcher.after("type", Target, (_, res) => {
                if (!res) return res;

                try {
                    const activity = findInReactTree(
                        res,
                        (x) =>
                            x?.props?.activity ||
                            (Array.isArray(x?.props?.activities) &&
                                x.props.activities.length > 0)
                    );

                    if (activity) {
                        logger.log("[FOUND ACTIVITY]", activity);
                    }
                } catch (e) {
                    logger.log("[ERROR]", e);
                }

                return res;
            })
        );
    },

    onUnload: () => {
        logger.log("[DEBUG] Plugin odładowany");

        for (const unpatch of unpatches) {
            try {
                unpatch();
            } catch {}
        }

        unpatches = [];
    }
};
