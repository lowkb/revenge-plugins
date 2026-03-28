import { patcher, logger } from "@vendetta";
import { findByTypeName, findByStoreName } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import UserRichPresence from "./UserRichPresence";

let unpatches: (() => void)[] = [];
const patchedMap = new WeakMap<any, boolean>();

async function waitForType(name: string) {
    let comp;
    while (!comp) {
        comp = findByTypeName(name);
        if (!comp) await new Promise(r => setTimeout(r, 50));
    }
    return comp;
}

function patchProfile(UserProfileContent: any, me: any) {
    return patcher.after("type", UserProfileContent, (args, res) => {
        const user = args[0]?.user;
        if (!user) return res;

        if (user.id !== me.id) return res;

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
    });
}

export default {
    onLoad: async () => {
        logger.log("[RPC] Plugin loading...");

        const UserProfileContent = await waitForType("UserProfileContent");
        const UserStore = findByStoreName("UserStore");
        const me = UserStore.getCurrentUser();

        logger.log("[RPC] Current user id:", me.id);

        unpatches.push(patchProfile(UserProfileContent, me));

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
