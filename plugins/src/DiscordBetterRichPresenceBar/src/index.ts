import { patcher } from "@vendetta";
import { findByTypeName, findInReactTree } from "@vendetta/metro";
import { logger } from "@vendetta";

let unpatches: Function[] = [];

function resolveRender(target: any): any {
    if (!target) return null;

    if (typeof target === "function") return target;

    if (typeof target?.type === "function") return target.type;

    if (typeof target?.type?.type === "function") return target.type.type;

    return null;
}

export default {
    onLoad: () => {
        if (unpatches.length) return;

        logger.log("[DEBUG] Plugin załadowany");

        const UserProfileContent = findByTypeName("UserProfileContent");

        if (!UserProfileContent) {
            logger.log("[DEBUG] UserProfileContent nie znaleziony");
            return;
        }

        const Render = resolveRender(UserProfileContent);

        if (!Render) {
            logger.log("[DEBUG] Nie znaleziono funkcji render");
            return;
        }

        unpatches.push(
            patcher.after("type", Render, (_, res) => {
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
