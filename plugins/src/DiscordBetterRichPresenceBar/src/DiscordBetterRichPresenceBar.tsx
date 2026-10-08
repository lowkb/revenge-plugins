import { after } from "@vendetta/patcher";
import { findByTypeName } from "@vendetta/metro";

type Unpatch = () => unknown;

let unpatch: Unpatch | null = null;
let started = false;
let loggedResults = new WeakSet<object>();

function getTypeName(node: any): string {
    const type = node?.type;

    if (typeof type === "string") {
        return type;
    }

    if (typeof type === "function") {
        return type.displayName || type.name || "Anonymous";
    }

    if (type && typeof type === "object") {
        return type.displayName || type.name || "Object";
    }

    return "Unknown";
}

function inspectTree(
    node: any,
    lines: string[],
    state: { count: number },
    depth = 0,
    maxDepth = 12,
): void {
    if (state.count >= 500 || depth > maxDepth) {
        return;
    }

    if (!node || typeof node !== "object") {
        return;
    }

    state.count++;

    const indent = "  ".repeat(depth);
    const typeName = getTypeName(node);
    const props = node?.props;

    const propKeys =
        props && typeof props === "object"
            ? Object.keys(props)
            : [];

    lines.push(
        `${indent}${typeName} props=[${propKeys.join(", ")}]`,
    );

    const children = props?.children;

    if (Array.isArray(children)) {
        for (const child of children) {
            inspectTree(
                child,
                lines,
                state,
                depth + 1,
                maxDepth,
            );
        }

        return;
    }

    inspectTree(
        children,
        lines,
        state,
        depth + 1,
        maxDepth,
    );
}

function patchUserProfileContent(): void {
    const UserProfileContent = findByTypeName("UserProfileContent");

    if (!UserProfileContent) {
        console.log("[DBRP] UserProfileContent not found");
        return;
    }

    console.log(
        "[DBRP] UserProfileContent found:",
        UserProfileContent,
    );

    unpatch = after(
        "type",
        UserProfileContent,
        (_args, result) => {
            if (
                !result ||
                typeof result !== "object" ||
                loggedResults.has(result)
            ) {
                return;
            }

            loggedResults.add(result);

            const lines: string[] = [];
            const state = { count: 0 };

            inspectTree(result, lines, state);

            console.log(
                `[DBRP] UserProfileContent tree (${state.count} nodes):\n${lines.join("\n")}`,
            );
        },
    );

    console.log("[DBRP] UserProfileContent patched");
}

export default {
    start() {
        if (started) {
            return;
        }

        started = true;

        console.log("[DBRP] Starting");

        try {
            patchUserProfileContent();
        } catch (error) {
            started = false;
            console.error("[DBRP] Failed to start:", error);
        }
    },

    stop() {
        if (!started) {
            return;
        }

        started = false;

        console.log("[DBRP] Stopping");

        try {
            unpatch?.();
        } catch (error) {
            console.error("[DBRP] Failed to unpatch:", error);
        } finally {
            unpatch = null;
            loggedResults = new WeakSet<object>();
        }

        console.log("[DBRP] Stopped");
    },
};
