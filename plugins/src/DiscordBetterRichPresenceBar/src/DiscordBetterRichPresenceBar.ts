import { patcher, logger } from "@vendetta";
import { findByName } from "@metro/common";

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

type Runtime = {
    React: typeof React;
    ReactNative: typeof import("react-native");
};

const patches: (() => unknown)[] = [];

const getUserStore = () => {
    const UserStore = findByName("UserStore");

    if (!UserStore) {
        throw new Error("UserStore not found");
    }

    return UserStore;
};

const getCurrentUserId = (): string | undefined => {
    try {
        return getUserStore()
            .getCurrentUser?.()
            ?.id;
    } catch {
        return undefined;
    }
};

const normalizeUrl = (
    value: unknown
): string | undefined => {
    if (typeof value !== "string") {
        return undefined;
    }

    const url = value.trim();

    if (!/^https?:\/\//i.test(url)) {
        return undefined;
    }

    return url;
};

const getActivityButtons = (
    activity: Activity | undefined
): { label: string; url: string }[] => {
    if (!activity?.buttons?.length) {
        return [];
    }

    const urls =
        activity.metadata?.button_urls ?? [];

    return activity.buttons
        .slice(0, 2)
        .map((button, index) => {
            const label =
                typeof button === "string"
                    ? button.trim()
                    : button?.label?.trim();

            const url =
                typeof button === "string"
                    ? normalizeUrl(urls[index])
                    : normalizeUrl(
                          button?.url ??
                              urls[index]
                      );

            if (!label || !url) {
                return undefined;
            }

            return {
                label,
                url,
            };
        })
        .filter(
            (
                button
            ): button is {
                label: string;
                url: string;
            } => Boolean(button)
        );
};

const openUrl = async (
    url: string
): Promise<void> => {
    try {
        const urlModule =
            findByName("url");

        if (urlModule?.openURL) {
            await urlModule.openURL(url);
            return;
        }
    } catch {}

    try {
        if (
            typeof window !== "undefined" &&
            typeof window.open === "function"
        ) {
            window.open(url);
        }
    } catch (error) {
        logger.error(
            "[DiscordBetterRichPresenceBar] Failed to open URL",
            error
        );
    }
};

const createButton = (
    runtime: Runtime,
    label: string,
    url: string,
    index: number
) => {
    const {
        React,
        ReactNative,
    } = runtime;

    const Button = findByName("Button");

    if (Button) {
        return React.createElement(Button, {
            key: `rich-presence-button-${index}`,
            text: label,
            size: "sm",
            variant: "secondary",
            onPress: () => {
                void openUrl(url);
            },
            style: {
                marginRight:
                    index === 0 ? 8 : 0,
                marginBottom: 8,
            },
        });
    }

    return React.createElement(
        ReactNative.Pressable,
        {
            key: `rich-presence-button-${index}`,
            onPress: () => {
                void openUrl(url);
            },
            style: {
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginRight:
                    index === 0 ? 8 : 0,
                marginBottom: 8,
                borderRadius: 6,
            },
        },
        React.createElement(
            ReactNative.Text,
            null,
            label
        )
    );
};

const createButtons = (
    runtime: Runtime,
    activity: Activity
) => {
    const buttons =
        getActivityButtons(activity);

    if (!buttons.length) {
        return null;
    }

    const {
        React,
        ReactNative,
    } = runtime;

    return React.createElement(
        ReactNative.View,
        {
            style: {
                flexDirection: "row",
                flexWrap: "wrap",
                marginTop: 8,
            },
        },
        buttons.map(
            ({ label, url }, index) =>
                createButton(
                    runtime,
                    label,
                    url,
                    index
                )
        )
    );
};

const patchActivityContainer = () => {
    const ActivityContainer =
        findByName(
            "UserActivityContainer"
        );

    if (!ActivityContainer) {
        throw new Error(
            "UserActivityContainer not found"
        );
    }

    const runtime: Runtime = {
        React,
        ReactNative:
            require("react-native"),
    };

    const unpatch = patcher.after(
        "render",
        ActivityContainer.prototype,
        function (
            _: unknown,
            result: ReactElement
        ) {
            const props =
                this?.props as
                    | ActivityProps
                    | undefined;

            if (!props?.activity) {
                return result;
            }

            const currentUserId =
                getCurrentUserId();

            if (
                !currentUserId ||
                props.user?.id !==
                    currentUserId
            ) {
                return result;
            }

            const buttons =
                createButtons(
                    runtime,
                    props.activity
                );

            if (!buttons) {
                return result;
            }

            if (
                !result ||
                typeof result !==
                    "object" ||
                !result.props
            ) {
                return result;
            }

            const children =
                result.props.children;

            return {
                ...result,
                props: {
                    ...result.props,
                    children:
                        Array.isArray(children)
                            ? [
                                  ...children,
                                  buttons,
                              ]
                            : [
                                  children,
                                  buttons,
                              ],
                },
            };
        }
    );

    patches.push(unpatch);
};

const start = () => {
    if (patches.length > 0) {
        return;
    }

    try {
        patchActivityContainer();

        logger.log(
            "[DiscordBetterRichPresenceBar] Loaded"
        );
    } catch (error) {
        logger.error(
            "[DiscordBetterRichPresenceBar] Failed to load",
            error
        );
    }
};

const stop = () => {
    for (
        const unpatch of patches.splice(0)
    ) {
        try {
            unpatch();
        } catch (error) {
            logger.error(
                "[DiscordBetterRichPresenceBar] Failed to unpatch",
                error
            );
        }
    }

    logger.log(
        "[DiscordBetterRichPresenceBar] Unloaded"
    );
};

export default {
    start,
    stop,
};
