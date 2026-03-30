import { patcher } from "@vendetta";
import { findByTypeName, findInReactTree } from "@vendetta/metro";
import { logger } from "@vendetta";

let unpatches: Function[] = [];

function logChildrenTree(obj: any, depth = 0) {
    if (!obj) return;
    const indent = "  ".repeat(depth);

    if (obj.type?.name) {
        logger.log(`${indent}[TYPE] ${obj.type.name} | key: ${obj.key}`);
        if (obj.type.name === "Activity") {
            logger.log(`${indent}>>> Activity FOUND!`, obj);
        }
    }

    if (Array.isArray(obj.children)) {
        obj.children.forEach((c: any) => logChildrenTree(c, depth + 1));
    } else if (obj.props?.children) {
        logChildrenTree(obj.props.children, depth + 1);
    }
}

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
                logChildrenTree(res);
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
