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

    const children = Array.isArray(obj.children)
        ? obj.children
        : obj.props?.children
        ? Array.isArray(obj.props.children)
            ? obj.props.children
            : [obj.props.children]
        : [];

    children.forEach((c: any) => logChildrenTree(c, depth + 1));
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
                if (!res) return res; // zabezpieczenie
                try {
                    logChildrenTree(res);
                } catch (e) {
                    logger.log("[ERROR] logChildrenTree failed:", e);
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
