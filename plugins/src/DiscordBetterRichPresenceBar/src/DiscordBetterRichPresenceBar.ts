import { logger } from "@vendetta";
import { after } from "@vendetta/patcher";
import {
    findByStoreName,
    findByTypeName,
} from "@vendetta/metro";
import {
    React,
    ReactNative,
} from "@vendetta/metro/common";
import { showToast } from "@vendetta/ui/toasts";

type Unpatch = () => unknown;

interface ActivityButton {
    label: string;
    url?: string;
}

interface Activity {
    type?: number;
    name?: string;
    details?: string;
    state?: string;
    application_id?: string;
    buttons?: Array<
        string | {
            label?: string;
            url?: string;
        }
    >;
    metadata?: {
        button_urls?: string[];
    };
}

interface RichPresenceButtonsProps {
    userId?: string;
}

const styles = {
    container: {
        marginTop: 8,
        marginHorizontal: 0,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#97979f0a",
        backgroundColor: "#97979f14",
    },

    header: {
        marginBottom: 8,
    },

    title: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "600",
    },

    subtitle: {
        marginTop: 2,
        color: "#b5bac1",
        fontSize: 12,
    },

    buttons: {
        flexDirection: "row" as const,
        gap: 8,
    },

    button: {
        flex: 1,
        minHeight: 40,
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderRadius: 8,
        backgroundColor: "#5865f2",
        alignItems: "center" as const,
        justifyContent: "center" as const,
    },

    buttonDisabled: {
        backgroundColor: "#4e5058",
        opacity: 0.8,
    },

    buttonText: {
        color: "#ffffff",
        fontSize: 13,
        fontWeight: "600",
        textAlign: "center" as const,
    },
};

function normalizeButtons(
    activity: Activity,
): ActivityButton[] {
    const buttons = activity.buttons;

    if (!Array.isArray(buttons)) {
        return [];
    }

    const urls =
        Array.isArray(
            activity.metadata?.button_urls,
        )
            ? activity.metadata!.button_urls!
            : [];

    return buttons
        .slice(0, 2)
        .map((button, index) => {
            if (
                typeof button === "string"
            ) {
                return {
                    label: button,
                    url: urls[index],
                };
            }

            return {
                label:
                    button?.label ||
                    `Button ${index + 1}`,
                url:
                    button?.url ||
                    urls[index],
            };
        })
        .filter(
            (button) =>
                Boolean(button.label),
        );
}

function getActivities(
    userId?: string,
): Activity[] {
    if (!userId) {
        return [];
    }

    try {
        const PresenceStore =
            findByStoreName(
                "PresenceStore",
            );

        if (
            !PresenceStore ||
            typeof PresenceStore.getActivities !==
                "function"
        ) {
            return [];
        }

        const activities =
            PresenceStore.getActivities(
                userId,
            );

        if (!Array.isArray(activities)) {
            return [];
        }

        return activities;
    } catch (error) {
        logger.error(
            `[DiscordBetterRichPresenceBar] Failed to get activities: ${String(error)}`,
        );

        return [];
    }
}

async function openUrl(
    url: string,
): Promise<void> {
    if (
        !url ||
        !/^https?:\/\//i.test(url)
    ) {
        showToast(
            "Rich Presence button has no valid URL",
        );

        return;
    }

    try {
        const Linking =
            ReactNative?.Linking;

        if (
            Linking &&
            typeof Linking.openURL ===
                "function"
        ) {
            await Linking.openURL(url);

            return;
        }

        showToast(
            "Unable to open Rich Presence URL",
        );
    } catch (error) {
        logger.error(
            `[DiscordBetterRichPresenceBar] Failed to open URL: ${String(error)}`,
        );

        showToast(
            "Failed to open Rich Presence URL",
        );
    }
}

function RichPresenceButtons(
    props: RichPresenceButtonsProps,
) {
    const [activities, setActivities] =
        React.useState<Activity[]>(() =>
            getActivities(
                props.userId,
            ),
        );

    React.useEffect(() => {
        let mounted = true;

        const update = () => {
            if (!mounted) {
                return;
            }

            setActivities(
                getActivities(
                    props.userId,
                ),
            );
        };

        update();

        const interval =
            setInterval(
                update,
                1000,
            );

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [props.userId]);

    const activityData =
        activities
            .map((activity) => ({
                activity,
                buttons:
                    normalizeButtons(
                        activity,
                    ),
            }))
            .filter(
                ({ buttons }) =>
                    buttons.length > 0,
            );

    if (
        activityData.length === 0
    ) {
        return null;
    }

    const { View, Text, TouchableOpacity } =
        ReactNative;

    const elements: any[] = [];

    for (
        const {
            activity,
            buttons,
        } of activityData
    ) {
        elements.push(
            React.createElement(
                View,
                {
                    key:
                        activity.id ||
                        activity.application_id ||
                        Math.random(),
                    style:
                        styles.container,
                },

                React.createElement(
                    View,
                    {
                        style:
                            styles.header,
                    },

                    React.createElement(
                        Text,
                        {
                            style:
                                styles.title,
                            numberOfLines: 1,
                        },
                        activity.name ||
                            "Rich Presence",
                    ),

                    activity.details ||
                    activity.state
                        ? React.createElement(
                              Text,
                              {
                                  style:
                                      styles.subtitle,
                                  numberOfLines: 2,
                              },
                              [
                                  activity.details,
                                  activity.state,
                              ]
                                  .filter(
                                      Boolean,
                                  )
                                  .join(
                                      " • ",
                                  ),
                          )
                        : null,
                ),

                React.createElement(
                    View,
                    {
                        style:
                            styles.buttons,
                    },
                    ...buttons.map(
                        (
                            button,
                            index,
                        ) => {
                            const hasUrl =
                                Boolean(
                                    button.url &&
                                        /^https?:\/\//i.test(
                                            button.url,
                                        ),
                                );

                            return React.createElement(
                                TouchableOpacity,
                                {
                                    key: `${button.label}-${index}`,
                                    style: [
                                        styles.button,
                                        !hasUrl &&
                                            styles.buttonDisabled,
                                    ],
                                    activeOpacity:
                                        0.75,
                                    onPress:
                                        () => {
                                            if (
                                                !hasUrl
                                            ) {
                                                showToast(
                                                    "This Rich Presence button has no URL",
                                                );

                                                return;
                                            }

                                            void openUrl(
                                                button.url!,
                                            );
                                        },
                                },
                                React.createElement(
                                    Text,
                                    {
                                        style:
                                            styles.buttonText,
                                        numberOfLines: 1,
                                    },
                                    button.label,
                                ),
                            );
                        },
                    ),
                ),
            ),
        );
    }

    return React.createElement(
        React.Fragment,
        null,
        ...elements,
    );
}

function getTypeName(
    type: any,
): string {
    if (
        typeof type === "string"
    ) {
        return type;
    }

    if (
        typeof type === "function"
    ) {
        return (
            type.displayName ||
            type.name ||
            "Anonymous"
        );
    }

    if (
        type &&
        typeof type === "object"
    ) {
        return (
            type.displayName ||
            type.name ||
            "Object"
        );
    }

    return "Unknown";
}

function injectIntoTree(
    node: any,
    depth = 0,
): {
    node: any;
    changed: boolean;
} {
    if (
        !node ||
        typeof node !== "object" ||
        depth > 30
    ) {
        return {
            node,
            changed: false,
        };
    }

    if (
        getTypeName(node.type) ===
        "UserProfileActivity"
    ) {
        const userId =
            node.props?.user?.id;

        if (!userId) {
            return {
                node,
                changed: false,
            };
        }

        const injected =
            React.createElement(
                React.Fragment,
                {
                    key:
                        `dbrp-${userId}`,
                },

                node,

                React.createElement(
                    RichPresenceButtons,
                    {
                        userId,
                    },
                ),
            );

        return {
            node: injected,
            changed: true,
        };
    }

    const props = node.props;

    if (
        !props ||
        typeof props !== "object"
    ) {
        return {
            node,
            changed: false,
        };
    }

    const children =
        props.children;

    if (
        Array.isArray(children)
    ) {
        let changed = false;

        const nextChildren =
            children.map(
                (child) => {
                    const result =
                        injectIntoTree(
                            child,
                            depth + 1,
                        );

                    if (
                        result.changed
                    ) {
                        changed = true;
                    }

                    return result.node;
                },
            );

        if (!changed) {
            return {
                node,
                changed: false,
            };
        }

        return {
            node:
                React.cloneElement(
                    node,
                    {
                        children:
                            nextChildren,
                    },
                ),
            changed: true,
        };
    }

    if (
        children &&
        typeof children ===
            "object"
    ) {
        const result =
            injectIntoTree(
                children,
                depth + 1,
            );

        if (!result.changed) {
            return {
                node,
                changed: false,
            };
        }

        return {
            node:
                React.cloneElement(
                    node,
                    {
                        children:
                            result.node,
                    },
                ),
            changed: true,
        };
    }

    return {
        node,
        changed: false,
    };
}

export class DiscordBetterRichPresenceBar {
    private unpatch: Unpatch | null =
        null;

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

        const unpatch =
            this.unpatch;

        this.unpatch = null;

        if (
            typeof unpatch ===
            "function"
        ) {
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
            findByTypeName(
                "UserProfileContent",
            );

        if (
            !UserProfileContent
        ) {
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
                    typeof result !==
                        "object"
                ) {
                    return result;
                }

                const injected =
                    injectIntoTree(
                        result,
                    );

                if (
                    !injected.changed
                ) {
                    return result;
                }

                logger.log(
                    "[DiscordBetterRichPresenceBar] Rich Presence buttons injected",
                );

                return injected.node;
            },
        );

        logger.log(
            "[DiscordBetterRichPresenceBar] UserProfileContent patched",
        );
    }
}

export default new DiscordBetterRichPresenceBar();
