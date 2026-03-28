import { patcher, logger } from "@vendetta";
import { findByTypeName } from "@vendetta/metro";
import { React, findInReactTree } from "@vendetta/metro/common";

export function patchUserProfileContent(): (() => void)[] {
    const unpatches: (() => void)[] = [];

    const UserProfileContent = findByTypeName("UserProfileContent");
    if (!UserProfileContent) {
        logger.warn("[RPC] UserProfileContent not found!");
        return unpatches;
    }

    const unpatch = patcher.after("type", UserProfileContent, (args, res) => {
        logger.log("[RPC] UserProfileContent rendered, args:", args);
        logger.log("[RPC] UserProfileContent render result:", res);

        const primaryInfo = findInReactTree(res, c => c?.type?.name === "PrimaryInfo");
        logger.log("[RPC] PrimaryInfo found:", primaryInfo);

        if (!primaryInfo) return res;

        const userId = args[0]?.user?.id;
        logger.log("[RPC] Current userId from args:", userId);

        return res;
    });

    unpatches.push(unpatch);
    return unpatches;
}
