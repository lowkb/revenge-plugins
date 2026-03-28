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
        if (!UserStore || !UserProfileStore) {
            logger.warn("[RPC] Stores not found!");
            return;
        }

        const me = UserStore.getCurrentUser();
        logger.log("[RPC] Current user id:", me.id);

        // patch renderowania profilu
        unpatches.push(
            patcher.after("getUserProfile", UserProfileStore, (args, res) => {
                if (!res) return res;

                const user = args[0];
                if (!user || user.id !== me.id) return res;

                const children = Array.isArray(res.props.children)
                    ? res.props.children
                    : [res.props.children];

                const primaryInfo = children.find(
                    (c: any) => c?.type?.name === "PrimaryInfo"
                );
                if (!primaryInfo) return res;

                if (!patchedMap.has(primaryInfo)) {
                    patchedMap.set(primaryInfo, true);

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

                    logger.log("[RPC] Added RPC buttons to profile for user id:", user.id);
                }

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
