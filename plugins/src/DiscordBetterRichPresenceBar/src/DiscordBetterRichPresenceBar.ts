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
    return metro.findByProps("getCurrentUser");
}

function getCurrentUserId(): string | undefined {
    return getUserStore()?.getCurrentUser?.()?.id;
}

function normalizeUrl(value: unknown): string | null {
    if (typeof value !== "string") return null;

    const url = value.trim();

    return /^https?:\/\//i.test(url) ? url : null;
}

function getActivityButtons(activity?: Activity): ActivityButton[] {
    if (!activity) return [];

    const buttons: ActivityButton[] = [];

    if (Array.isArray(activity.buttons)) {
        for (const button of activity.buttons) {
            if (typeof button === "string") {
                const url = normalizeUrl(button);

                if (url) {
                    buttons.push({
                        label: "Open",
                        url,
                    });
                }

                continue;
            }

            const url = normalizeUrl(button?.url);

            if (url) {
                buttons.push({
                    label: button.label?.trim() || "Open",
                    url,
                });
            }
        }
    }

    if (Array.isArray(activity.metadata?.button_urls)) {
        for (const value of activity.metadata.button_urls) {
            const url = normalizeUrl(value);

            if (url) {
                buttons.push({
                    label: "Open",
                    url,
                });
            }
        }
    }

    return buttons.slice(0, 2);
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

function createButton(
    button: ActivityButton,
    React: typeof import("react"),
) {
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

function createButtonBar(
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
            key: "discord-better-rich-presence-buttons",
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
    const ActivityModule = metro.findByDisplayName(
        "UserActivityContainer",
        false,
    );

    if (!ActivityModule?.default) {
        throw new Error("UserActivityContainer module not found");
    }

    const React = metro.common.React;

    if (!React?.createElement) {
        throw new Error("Discord React module not found");
    }

    const unpatch = patcher.after(
        "default",
        ActivityModule,
        function (
            args: [ActivityProps],
            result: ReactElement | null,
        ) {
            const props = args?.[0];

            const currentUserId = getCurrentUserId();
            const profileUserId = props?.user?.id;

            if (!currentUserId || !profileUserId) {
                return result;
            }

            if (currentUserId !== profileUserId) {
                return result;
            }

            const buttons = getActivityButtons(props.activity);

            if (buttons.length === 0 || !result?.props) {
                return result;
            }

            const buttonBar = createButtonBar(buttons, React);

            if (!buttonBar) {
                return result;
            }

            const children = result.props.children;

            result.props = {
                ...result.props,
                children: Array.isArray(children)
                    ? [...children, buttonBar]
                    : [children, buttonBar],
            };

            return result;
        },
    );

    patches.push(unpatch);
}

const start = () => {
    if (patches.length > 0) return;

    try {
        patchActivityContainer();

        logger.log(
            "[DiscordBetterRichPresenceBar] Loaded",
        );
    } catch (error) {
        logger.error(
            "[DiscordBetterRichPresenceBar] Failed to load",
            error,
        );
    }
};

const stop = () => {
    for (const unpatch of patches.splice(0)) {
        try {
            unpatch();
        } catch (error) {
            logger.error(
                "[DiscordBetterRichPresenceBar] Failed to unpatch",
                error,
            );
        }
    }

    logger.log(
        "[DiscordBetterRichPresenceBar] Unloaded",
    );
};

export default {
    start,
    stop,
};
