import { logger, metro, patcher } from "@vendetta";

type ActivityButton = {
    label?: string;
    url?: string;
};

type Activity = {
    buttons?: ActivityButton[] | string[];
    metadata?: {
        button_urls?: string[];
    };
};

type ActivityProps = {
    activity?: Activity;
    user?: {
        id?: string;
    };
};

type ReactElement = {
    type?: unknown;
    props?: Record<string, any>;
    key?: string | null;
};

const patches: (() => unknown)[] = [];

function getUserStore() {
    return metro.findByName("UserStore");
}

function getCurrentUserId(): string | undefined {
    const UserStore = getUserStore();

    return UserStore?.getCurrentUser?.()?.id;
}

function normalizeUrl(url: unknown): string | null {
    if (typeof url !== "string") return null;

    const value = url.trim();

    return /^https?:\/\//i.test(value) ? value : null;
}

function getActivityButtons(activity?: Activity): ActivityButton[] {
    if (!activity) return [];

    const result: ActivityButton[] = [];

    if (Array.isArray(activity.buttons)) {
        for (const button of activity.buttons) {
            if (typeof button === "string") {
                const url = normalizeUrl(button);

                if (url) {
                    result.push({ label: "Open", url });
                }
            } else {
                const url = normalizeUrl(button?.url);

                if (url) {
                    result.push({
                        label: button.label?.trim() || "Open",
                        url,
                    });
                }
            }
        }
    }

    if (Array.isArray(activity.metadata?.button_urls)) {
        for (const value of activity.metadata.button_urls) {
            const url = normalizeUrl(value);

            if (url) {
                result.push({
                    label: "Open",
                    url,
                });
            }
        }
    }

    return result.slice(0, 2);
}

async function openUrl(url: string) {
    const openURL = metro.common.url?.openURL;

    if (typeof openURL === "function") {
        await openURL(url);
        return;
    }

    if (typeof window?.open === "function") {
        window.open(url);
    }
}

function createButton(button: ActivityButton, React: typeof import("react")) {
    const ReactNative = metro.common.ReactNative;

    if (!ReactNative?.Pressable || !ReactNative?.Text) {
        return null;
    }

    return React.createElement(
        ReactNative.Pressable,
        {
            key: button.url,
            onPress: () => openUrl(button.url!),
            style: {
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 6,
                marginRight: 8,
                marginTop: 8,
            },
        },
        React.createElement(
            ReactNative.Text,
            null,
            button.label || "Open",
        ),
    );
}

function createButtons(
    buttons: ActivityButton[],
    React: typeof import("react"),
) {
    const ReactNative = metro.common.ReactNative;

    if (!ReactNative?.View) {
        return null;
    }

    return React.createElement(
        ReactNative.View,
        {
            style: {
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
            },
        },
        buttons.map(button => createButton(button, React)),
    );
}

function patchActivityContainer() {
    const ActivityContainer = metro.findByName("UserActivityContainer");

    if (!ActivityContainer?.prototype?.render) {
        throw new Error("UserActivityContainer.render not found");
    }

    const React = metro.common.React;

    const unpatch = patcher.after(
        "render",
        ActivityContainer.prototype,
        function (
            this: { props?: ActivityProps },
            result: ReactElement,
        ) {
            const currentUserId = getCurrentUserId();
            const userId = this.props?.user?.id;

            if (!currentUserId || !userId || currentUserId !== userId) {
                return result;
            }

            const buttons = getActivityButtons(this.props?.activity);

            if (buttons.length === 0 || !result?.props) {
                return result;
            }

            const buttonBar = createButtons(buttons, React);

            if (!buttonBar) {
                return result;
            }

            const children = result.props.children;

            if (Array.isArray(children)) {
                result.props.children = [...children, buttonBar];
            } else {
                result.props.children = [
                    children,
                    buttonBar,
                ];
            }

            return result;
        },
    );

    patches.push(unpatch);
}

const start = () => {
    if (patches.length > 0) return;

    try {
        patchActivityContainer();
        logger.log("[DiscordBetterRichPresenceBar] Loaded");
    } catch (error) {
        logger.error("[DiscordBetterRichPresenceBar] Failed to load", error);
    }
};

const stop = () => {
    for (const unpatch of patches.splice(0)) {
        try {
            unpatch();
        } catch (error) {
            logger.error("[DiscordBetterRichPresenceBar] Failed to unpatch", error);
        }
    }

    logger.log("[DiscordBetterRichPresenceBar] Unloaded");
};

export default {
    start,
    stop,
};
