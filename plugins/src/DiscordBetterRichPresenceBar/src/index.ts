import { patcher, logger } from "@vendetta";
import { findByStoreName } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import UserRichPresence from "./UserRichPresence";

let unpatches: (() => void)[] = [];
const patchedMap = new WeakMap<any, boolean>();

export default {
    onLoad: () => {
        logger.log("[RPC] Plugin loading...");

        const UserStore = findByStoreName("UserStore");
        const UserProfileStore = findByStoreName("UserProfileStore");

        if (!UserStore) {
            logger.warn("[RPC] UserStore not found!");
            return;
        }
        if (!UserProfileStore) {
            logger.warn("[RPC] UserProfileStore not found!");
            return;
        }

        const me = UserStore.getCurrentUser();
        logger.log("[RPC] Current user id:", me.id);

        logger.log("[RPC] Patching getUserProfile method...");

        unpatches.push(
            patcher.after("getUserProfile", UserProfileStore, (args, res) => {
                const userArg = args[0];
                const userId = typeof userArg === "string" ? userArg : userArg?.id;
                logger.log("[RPC] getUserProfile called with args:", args);
                logger.log("[RPC] Rendering profile for userId:", userId);

                if (!userId) {
                    logger.log("[RPC] No userId found, skipping patch");
                    return res;
                }

                if (userId !== me.id) {
                    logger.log("[RPC] Not current user (userId !== me.id), skipping RPC buttons");
                    return res;
                }

                const children = Array.isArray(res.props.children)
                    ? res.props.children
                    : [res.props.children];
                logger.log("[RPC] Children array prepared, length:", children.length);

                const primaryInfo = children.find(
                    (c: any) => c?.type?.name === "PrimaryInfo"
                );
                if (!primaryInfo) {
                    logger.warn("[RPC] PrimaryInfo component not found in children");
                    return res;
                }
                logger.log("[RPC] PrimaryInfo component found");

                if (patchedMap.has(primaryInfo)) {
                    logger.log("[RPC] RPC buttons already patched for this PrimaryInfo");
                    return res;
                }

                patchedMap.set(primaryInfo, true);
                logger.log("[RPC] Patching PrimaryInfo with RPC buttons...");

                const existingChildren = Array.isArray(primaryInfo.props.children)
                    ? primaryInfo.props.children
                    : [primaryInfo.props.children];
                logger.log("[RPC] Existing children length:", existingChildren.length);

                primaryInfo.props.children = [
                    ...existingChildren,
                    React.createElement(UserRichPresence, {
                        onRPC1: () => logger.log("[RPC] RPC 1 clicked"),
                        onRPC2: () => logger.log("[RPC] RPC 2 clicked"),
                    })
                ];

                logger.log("[RPC] RPC buttons added successfully for current user");

                return res;
            })
        );

        logger.log("[RPC] Plugin loaded successfully");
    },

    onUnload: () => {
        logger.log("[RPC] Unloading plugin...");
        unpatches.forEach(u => u());
        unpatches = [];
        patchedMap.clear();
        logger.log("[RPC] Plugin unloaded");
    }
};
