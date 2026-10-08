import { logger } from "@vendetta";
import { after } from "@vendetta/patcher";
import { findByTypeName } from "@vendetta/metro";

type Unpatch = () => unknown;

interface InspectState {
    count: number;
}

export class DiscordBetterRichPresenceBar {
    private unpatch: Unpatch | null = null;
    private started = false;

    public start(): void {
        if (this.started) {
            return;
        }

        this.started = true;

        logger.log(
            "[DiscordBetterRichPresenceBar] Plugin loaded",
        );

        try {
            this.patchUserProfileContent();
        } catch (error) {
            this.started = false;

            logger.error(
                `[DiscordBetterRichPresenceBar] Failed to start: ${String(error)}`,
            );
        }
    }

    public stop(): void {
        if (!this.started) {
            return;
        }

        this.started = false;

        logger.log(
            "[DiscordBetterRichPresenceBar] Plugin unloading",
        );

        const unpatch = this.unpatch;
        this.unpatch = null;

        if (typeof unpatch === "function") {
            try {
                unpatch();
            } catch (error) {
                logger.error(
                    `[DiscordBetterRichPresenceBar] Failed to unpatch: ${String(error)}`,
                );
            }
        }
    }

    private patchUserProfileContent(): void {
        const UserProfileContent =
            findByTypeName("UserProfileContent");

        if (!UserProfileContent) {
            logger.log(
                "[DiscordBetterRichPresenceBar] UserProfileContent not found",
            );

            return;
        }

        logger.log(
            "[DiscordBetterRichPresenceBar] UserProfileContent found",
        );

        const inspectTree = this.inspectTree.bind(this);

        this.unpatch = after(
            "type",
            UserProfileContent,
            (_args, result) => {
                if (
                    !result ||
                    typeof result !== "object"
                ) {
                    return;
                }

                const lines: string[] = [];
                const state: InspectState = {
                    count: 0,
                };

                inspectTree(
                    result,
                    lines,
                    state,
                );

                logger.log(
                    `[DiscordBetterRichPresenceBar] UserProfileContent tree (${state.count} nodes):\n${lines.join("\n")}`,
                );
            },
        );

        logger.log(
            "[DiscordBetterRichPresenceBar] UserProfileContent patched",
        );
    }

    private inspectTree(
        node: any,
        lines: string[],
        state: InspectState,
        depth = 0,
        maxDepth = 12,
    ): void {
        if (
            !node ||
            typeof node !== "object" ||
            depth > maxDepth ||
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
                    ? type.displayName ||
                      type.name ||
                      "Anonymous"
                    : type &&
                        typeof type === "object"
                        ? type.displayName ||
                          type.name ||
                          "Object"
                        : "Unknown";

        const props =
            node.props &&
            typeof node.props === "object"
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
}

export default new DiscordBetterRichPresenceBar();
