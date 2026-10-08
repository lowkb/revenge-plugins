import { after } from "@vendetta/patcher";
import { findByTypeName } from "@vendetta/metro";

type Unpatch = () => unknown;

interface InspectState {
    count: number;
}

export default class DiscordBetterRichPresenceBar {
    private static unpatch: Unpatch | null = null;
    private static started = false;
    private static loggedResults = new WeakSet<object>();

    private static getTypeName(node: any): string {
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

    private static inspectTree(
        node: any,
        lines: string[],
        state: InspectState,
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
        const typeName = this.getTypeName(node);
        const props = node.props;

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
                this.inspectTree(
                    child,
                    lines,
                    state,
                    depth + 1,
                    maxDepth,
                );
            }

            return;
        }

        this.inspectTree(
            children,
            lines,
            state,
            depth + 1,
            maxDepth,
        );
    }

    private static patchUserProfileContent(): void {
        const UserProfileContent =
            findByTypeName("UserProfileContent");

        if (!UserProfileContent) {
            console.log(
                "[DBRP] UserProfileContent not found",
            );

            return;
        }

        console.log(
            "[DBRP] UserProfileContent found:",
            UserProfileContent,
        );

        this.unpatch = after(
            "type",
            UserProfileContent,
            (_args, result) => {
                if (
                    !result ||
                    typeof result !== "object" ||
                    this.loggedResults.has(result)
                ) {
                    return;
                }

                this.loggedResults.add(result);

                const lines: string[] = [];
                const state: InspectState = {
                    count: 0,
                };

                this.inspectTree(
                    result,
                    lines,
                    state,
                );

                console.log(
                    `[DBRP] UserProfileContent tree (${state.count} nodes):\n${lines.join("\n")}`,
                );
            },
        );

        console.log(
            "[DBRP] UserProfileContent patched",
        );
    }

    public static start(): void {
        if (this.started) {
            return;
        }

        this.started = true;

        console.log("[DBRP] Starting");

        try {
            this.patchUserProfileContent();
        } catch (error) {
            this.started = false;

            console.error(
                "[DBRP] Failed to start:",
                error,
            );
        }
    }

    public static stop(): void {
        if (!this.started) {
            return;
        }

        this.started = false;

        console.log("[DBRP] Stopping");

        try {
            this.unpatch?.();
        } catch (error) {
            console.error(
                "[DBRP] Failed to unpatch:",
                error,
            );
        } finally {
            this.unpatch = null;
            this.loggedResults = new WeakSet<object>();
        }

        console.log("[DBRP] Stopped");
    }
}
