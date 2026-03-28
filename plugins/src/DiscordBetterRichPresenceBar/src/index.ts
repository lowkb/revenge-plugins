import { patcher, logger } from "@vendetta";
import { findByTypeName, findByStoreName } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import UserRichPresence from "./UserRichPresence";
import { React } from "@vendetta/metro/common";

let unpatches: (() => void)[] = [];
const patchedMap = new WeakMap<any, boolean>();

export default {
    onLoad: () => {
        logger.log("[RPC] Plugin loading...");

        const UserProfileContent = findByTypeName("UserProfileContent");
        const UserStore = findByStoreName("UserStore");
        const me = UserStore.getCurrentUser();
        logger.log("[RPC] Current user id:", me.id);

        unpatches.push(
            patcher.after("type", UserProfileContent, (args, res) => {
                const user = args[0]?.user;
                if (!user) {
                    logger.log("[RPC] No user found in args, skipping patch");
                    return res;
                }

                if (user.id !== me.id) {
                    logger.log("[RPC] Not current user, skipping RPC buttons");
                    return res;
                }

                const children = Array.isArray(res.props.children)
                    ? res.props.children
                    : [res.props.children];

                const primaryInfo = children.find(
                    (c: any) => c?.type?.name === "PrimaryInfo"
                );

                if (!primaryInfo) {
                    logger.warn("[RPC] PrimaryInfo component not found");
                    return res;
                }

                if (patchedMap.has(primaryInfo)) {
                    logger.log("[RPC] RPC buttons already patched");
                    return res;
                }

                patchedMap.set(primaryInfo, true);
                logger.log("[RPC] Adding RPC buttons to profile");

                const existingChildren = Array.isArray(primaryInfo.props.children)
                    ? primaryInfo.props.children
                    : [primaryInfo.props.children];

                primaryInfo.props.children = [
                    ...existingChildren,
                    React.createElement(UserRichPresence, {
                        onRPC1: () => logger.log("[RPC] RPC 1 clicked"),
                        onRPC2: () => logger.log("[RPC] RPC 2 clicked"),
                    })
                ];

                return res;
            })
        );

        logger.log("[RPC] Plugin loaded successfully");
    },

    onUnload: () => {
        logger.log("[RPC] Unloading plugin...");
        unpatches.forEach(u => u());
        unpatches = [];
        logger.log("[RPC] Plugin unloaded");
    }
};
