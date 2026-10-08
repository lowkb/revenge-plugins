import { after } from "@vendetta/patcher";
import { findByTypeName } from "@vendetta/metro";

type Unpatch = () => unknown;

export default class DiscordBetterRichPresenceBar {
    private unpatch: Unpatch | null = null;
    private started = false;
    private loggedResults = new WeakSet<object>();

    public start(): void {
        if (this.started) {
            return;
        }

        this.started = true;

        console.log("[DBRP] Starting");

        try {
            this.patchUserProfileContent();
        } catch (error) {
            this.started = false;
            console.error("[DBRP] Failed to start:", error);
        }
    }

    public stop(): void {
        if (!this.started) {
            return;
        }

        this.started = false;

        console.log("[DBRP] Stopping");

        try {
            this.unpatch?.();
        } catch (error) {
            console.error("[DBRP] Failed to unpatch:", error);
        } finally {
            this.unpatch = null;
            this.loggedResults = new WeakSet<object>();
        }

        console.log("[DBRP] Stopped");
    }

    private patchUserProfileContent(): void {
        const UserProfileContent = findByTypeName("UserProfileContent");

        if (!UserProfileContent) {
            console.log("[DBRP] UserProfileContent not found");
            return;
        }

        console.log("[DBRP] UserProfileContent found");

        const instance = this;

        this.unpatch = after(
            "type",
            UserProfileContent,
            (_args, result) => {
                if (
                    !result ||
                    typeof result !== "object" ||
                    instance.loggedResults.has(result)
                ) {
                    return;
                }

                instance.loggedResults.add(result);

                const lines: string[] = [];
                instance.inspectTree(result, lines);

                console.log(
                    `[DBRP] UserProfileContent tree:\n${lines.join("\n")}`,
                );
            },
        );

        console.log("[DBRP] UserProfileContent patched");
    }

    private inspectTree(
        node: any,
        lines: string[],
        depth = 0,
        state = { count: 0 },
    ): void {
        if (
            !node ||
            typeof node !== "object" ||
            depth > 12 ||
            state.count >= 500
        ) {
            return;
        }

        state.count++;

        const type = node.type;

        const typeName =
            typeof type === "string"
                ? type
                : typeof type === "function"
                    ? type.displayName || type.name || "Anonymous"
                    : type && typeof type === "object"
                        ? type.displayName || type.name || "Object"
                        : "Unknown";

        const props =
            node.props && typeof node.props === "object"
                ? node.props
                : null;

        const propKeys = props
            ? Object.keys(props)
            : [];

        lines.push(
            `${"  ".repeat(depth)}${typeName} props=[${propKeys.join(", ")}]`,
        );

        const children = props?.children;

        if (Array.isArray(children)) {
            for (const child of children) {
                this.inspectTree(
                    child,
                    lines,
                    depth + 1,
                    state,
                );
            }

            return;
        }

        this.inspectTree(
            children,
            lines,
            depth + 1,
            state,
        );
    }
    }
