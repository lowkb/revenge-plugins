import { logger } from "@vendetta";
import { after } from "@vendetta/patcher";
import { findByTypeName } from "@vendetta/metro";

type Unpatch = () => unknown;

interface DumpState {
    count: number;
    seen: WeakSet<object>;
}

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

function formatValue(
    value: any,
    depth = 0,
    seen = new WeakSet<object>(),
): string {
    if (value === null) {
        return "null";
    }

    if (value === undefined) {
        return "undefined";
    }

    if (typeof value === "string") {
        return JSON.stringify(value);
    }

    if (
        typeof value === "number" ||
        typeof value === "boolean" ||
        typeof value === "bigint"
    ) {
        return String(value);
    }

    if (typeof value === "function") {
        return `[Function ${value.name || "anonymous"}]`;
    }

    if (typeof value !== "object") {
        return String(value);
    }

    if (seen.has(value)) {
        return "[Circular]";
    }

    if (depth >= 4) {
        return `[${value.constructor?.name || "Object"}]`;
    }

    seen.add(value);

    if (Array.isArray(value)) {
        const items = value
            .slice(0, 20)
            .map((item) =>
                formatValue(
                    item,
                    depth + 1,
                    seen,
                ),
            );

        if (value.length > 20) {
            items.push(
                `... ${value.length - 20} more`,
            );
        }

        return `[${items.join(", ")}]`;
    }

    const entries: string[] = [];

    for (const key of Object.keys(value).slice(0, 50)) {
        try {
            entries.push(
                `${key}: ${formatValue(
                    value[key],
                    depth + 1,
                    seen,
                )}`,
            );
        } catch {
            entries.push(
                `${key}: [Unreadable]`,
            );
        }
    }

    if (Object.keys(value).length > 50) {
        entries.push("... more");
    }

    return `{ ${entries.join(", ")} }`;
}

function dumpNode(
    node: any,
    lines: string[],
    state: DumpState,
    depth = 0,
): void {
    if (
        !node ||
        typeof node !== "object" ||
        state.count >= 300 ||
        depth > 15
    ) {
        return;
    }

    if (state.seen.has(node)) {
        lines.push(
            `${"  ".repeat(depth)}[Circular node]`,
        );

        return;
    }

    state.seen.add(node);
    state.count++;

    const typeName = getTypeName(node);
    const props =
        node.props &&
        typeof node.props === "object"
            ? node.props
            : null;

    lines.push(
        `${"  ".repeat(depth)}<${typeName}>`,
    );

    if (!props) {
        lines.push(
            `${"  ".repeat(depth + 1)}props: null`,
        );

        return;
    }

    const keys = Object.keys(props);

    lines.push(
        `${"  ".repeat(depth + 1)}props:`,
    );

    for (const key of keys) {
        let value: string;

        try {
            value = formatValue(props[key]);
        } catch (error) {
            value = `[Error: ${String(error)}]`;
        }

        lines.push(
            `${"  ".repeat(depth + 2)}${key}: ${value}`,
        );
    }

    const children = props.children;

    if (children === undefined) {
        return;
    }

    lines.push(
        `${"  ".repeat(depth + 1)}children:`,
    );

    if (Array.isArray(children)) {
        for (const child of children) {
            if (
                child &&
                typeof child === "object" &&
                "type" in child
            ) {
                dumpNode(
                    child,
                    lines,
                    state,
                    depth + 2,
                );
            } else {
                lines.push(
                    `${"  ".repeat(depth + 2)}${formatValue(child)}`,
                );
            }
        }

        return;
    }

    if (
        children &&
        typeof children === "object" &&
        "type" in children
    ) {
        dumpNode(
            children,
            lines,
            state,
            depth + 2,
        );

        return;
    }

    lines.push(
        `${"  ".repeat(depth + 2)}${formatValue(children)}`,
    );
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

                const lines: string[] = [];
                const state: DumpState = {
                    count: 0,
                    seen: new WeakSet<object>(),
                };

                dumpNode(
                    activity,
                    lines,
                    state,
                );

                logger.log(
                    `[DiscordBetterRichPresenceBar] UserProfileActivity dump (${state.count} nodes):\n${lines.join("\n")}`,
                );
            },
        );

        logger.log(
            "[DiscordBetterRichPresenceBar] UserProfileContent patched",
        );
    }
}

export default new DiscordBetterRichPresenceBar();
