import { logger } from "@vendetta";
import { after } from "@vendetta/patcher";
import { findByTypeName } from "@vendetta/metro";
import { afterJSX } from "@revenge-mod/react/jsx-runtime";

type Unpatch = () => unknown;

function getTypeName(type: any): string {
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

function safeValue(
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

    if (depth >= 3) {
        return `[${value.constructor?.name || "Object"}]`;
    }

    seen.add(value);

    if (Array.isArray(value)) {
        return `[${value
            .slice(0, 20)
            .map((item) =>
                safeValue(
                    item,
                    depth + 1,
                    seen,
                ),
            )
            .join(", ")}]`;
    }

    const output: string[] = [];

    for (const key of Object.keys(value).slice(0, 50)) {
        try {
            output.push(
                `${key}: ${safeValue(
                    value[key],
                    depth + 1,
                    seen,
                )}`,
            );
        } catch {
            output.push(
                `${key}: [Unreadable]`,
            );
        }
    }

    return `{ ${output.join(", ")} }`;
}

function dumpElement(
    element: any,
): void {
    if (
        !element ||
        typeof element !== "object"
    ) {
        return;
    }

    const type = getTypeName(element.type);
    const props = element.props;

    logger.log(
        `[DiscordBetterRichPresenceBar] JSX element <${type}>`,
    );

    if (
        !props ||
        typeof props !== "object"
    ) {
        logger.log(
            "[DiscordBetterRichPresenceBar] props: null",
        );

        return;
    }

    logger.log(
        `[DiscordBetterRichPresenceBar] props:\n${safeValue(props)}`,
    );

    const children = props.children;

    if (children === undefined) {
        logger.log(
            "[DiscordBetterRichPresenceBar] children: undefined",
        );

        return;
    }

    if (Array.isArray(children)) {
        logger.log(
            `[DiscordBetterRichPresenceBar] children: array(${children.length})`,
        );

        for (let i = 0; i < children.length; i++) {
            const child = children[i];

            if (
                child &&
                typeof child === "object"
            ) {
                logger.log(
                    `[DiscordBetterRichPresenceBar] child[${i}] <${getTypeName(child.type)}> props=${safeValue(child.props)}`,
                );
            } else {
                logger.log(
                    `[DiscordBetterRichPresenceBar] child[${i}]=${safeValue(child)}`,
                );
            }
        }

        return;
    }

    if (
        children &&
        typeof children === "object"
    ) {
        logger.log(
            `[DiscordBetterRichPresenceBar] child <${getTypeName(children.type)}> props=${safeValue(children.props)}`,
        );

        return;
    }

    logger.log(
        `[DiscordBetterRichPresenceBar] children=${safeValue(children)}`,
    );
}

export class DiscordBetterRichPresenceBar {
    private unpatches: Unpatch[] = [];
    private started = false;
    private activityType: any = null;

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

        for (const unpatch of this.unpatches.splice(0)) {
            try {
                unpatch();
            } catch {}
        }

        this.activityType = null;

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

        this.unpatches.push(
            after(
                "type",
                UserProfileContent,
                (_args, result) => {
                    this.findActivityType(result);
                },
            ),
        );

        logger.log(
            "[DiscordBetterRichPresenceBar] UserProfileContent patched",
        );
    }

    private findActivityType(
        node: any,
    ): void {
        if (
            !node ||
            typeof node !== "object"
        ) {
            return;
        }

        if (
            getTypeName(node.type) ===
            "UserProfileActivity"
        ) {
            if (this.activityType === node.type) {
                return;
            }

            this.activityType = node.type;

            logger.log(
                "[DiscordBetterRichPresenceBar] Found UserProfileActivity JSX type",
            );

            this.patchActivityJSX(node.type);

            return;
        }

        const props = node.props;

        if (
            !props ||
            typeof props !== "object"
        ) {
            return;
        }

        const children = props.children;

        if (Array.isArray(children)) {
            for (const child of children) {
                this.findActivityType(child);
            }

            return;
        }

        this.findActivityType(children);
    }

    private patchActivityJSX(
        activityType: any,
    ): void {
        const unpatch = afterJSX(
            activityType,
            (element: any) => {
                logger.log(
                    "[DiscordBetterRichPresenceBar] UserProfileActivity JSX intercepted",
                );

                dumpElement(element);

                return element;
            },
        );

        this.unpatches.push(unpatch);
    }
}

export default new DiscordBetterRichPresenceBar();
