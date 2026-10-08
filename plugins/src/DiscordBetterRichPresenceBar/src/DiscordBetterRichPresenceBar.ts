import { logger } from "@vendetta";
import { after } from "@vendetta/patcher";
import { findByTypeName } from "@vendetta/metro";

type Unpatch = () => unknown;

function getTypeName(node: any): string {
    if (!node) {
        return "Unknown";
    }

    const type = node.type;

    if (typeof type === "string") {
        return type;
    }

    if (typeof type === "function") {
        return (
            type.displayName ||
            type.name ||
            "Anonymous"
        );
    }

    if (type && typeof type === "object") {
        return (
            type.displayName ||
            type.name ||
            "Object"
        );
    }

    return "Unknown";
}

function findUserProfileActivity(
    node: any,
    seen = new WeakSet<object>(),
): any | null {
    if (
        !node ||
        typeof node !== "object"
    ) {
        return null;
    }

    if (seen.has(node)) {
        return null;
    }

    seen.add(node);

    if (
        getTypeName(node) ===
        "UserProfileActivity"
    ) {
        return node;
    }

    const props = node.props;

    if (
        !props ||
        typeof props !== "object"
    ) {
        return null;
    }

    const children = props.children;

    if (Array.isArray(children)) {
        for (const child of children) {
            const found =
                findUserProfileActivity(
                    child,
                    seen,
                );

            if (found) {
                return found;
            }
        }

        return null;
    }

    return findUserProfileActivity(
        children,
        seen,
    );
}

function dumpActivityType(
    activity: any,
): void {
    const type = activity?.type;

    logger.log(
        "[DiscordBetterRichPresenceBar] UserProfileActivity type:",
    );

    if (typeof type === "function") {
        logger.log(
            `[DiscordBetterRichPresenceBar] type.name: ${type.name || "Anonymous"}`,
        );

        logger.log(
            `[DiscordBetterRichPresenceBar] type.displayName: ${type.displayName || "undefined"}`,
        );

        try {
            const source =
                Function.prototype.toString.call(
                    type,
                );

            logger.log(
                `[DiscordBetterRichPresenceBar] type source length: ${source.length}`,
            );

            logger.log(
                `[DiscordBetterRichPresenceBar] type source:\n${source}`,
            );
        } catch (error) {
            logger.error(
                `[DiscordBetterRichPresenceBar] Failed to inspect type: ${String(error)}`,
            );
        }

        return;
    }

    logger.log(
        `[DiscordBetterRichPresenceBar] type is ${typeof type}: ${String(type)}`,
    );

    if (
        type &&
        typeof type === "object"
    ) {
        try {
            logger.log(
                `[DiscordBetterRichPresenceBar] type object keys: ${Object.keys(type).join(", ")}`,
            );
        } catch (error) {
            logger.error(
                `[DiscordBetterRichPresenceBar] Failed to inspect type object: ${String(error)}`,
            );
        }
    }
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

        logger.log(
            "[DiscordBetterRichPresenceBar] Plugin unloaded",
        );
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

                const activity =
                    findUserProfileActivity(result);

                if (!activity) {
                    return;
                }

                dumpActivityType(activity);
            },
        );

        logger.log(
            "[DiscordBetterRichPresenceBar] UserProfileContent patched",
        );
    }
}

export default new DiscordBetterRichPresenceBar();
