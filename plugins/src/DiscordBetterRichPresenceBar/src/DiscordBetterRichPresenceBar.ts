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

interface Activity {
    id?: string;
    application_id?: string;
    name?: string;
    details?: string;
    state?: string;
    type?: number;
    buttons?: unknown[];
    metadata?: {
        button_urls?: string[];
    };
}

interface ActivityButton {
    label: string;
    url?: string;
}

const h = React.createElement;

function getActivities(
    userId: string,
): Activity[] {
    try {
        const PresenceStore =
            findByStoreName("PresenceStore");

        if (
            !PresenceStore ||
            typeof PresenceStore.getActivities !==
                "function"
        ) {
            logger.log(
                "[DBRP] PresenceStore.getActivities not found",
            );

            return [];
        }

        const result =
            PresenceStore.getActivities(
                userId,
            );

        if (!Array.isArray(result)) {
            return [];
        }

        return result;
    } catch (error) {
        logger.error(
            `[DBRP] getActivities failed: ${String(error)}`,
        );

        return [];
    }
}

function getButtons(
    activity: Activity,
): ActivityButton[] {
    if (
        !Array.isArray(
            activity.buttons,
        )
    ) {
        return [];
    }

    const urls =
        activity.metadata?.button_urls ??
        [];

    return activity.buttons
        .map((button, index) => {
            if (
                typeof button ===
                "string"
            ) {
                return {
                    label: button,
                    url: urls[index],
                };
            }

            if (
                button &&
                typeof button ===
                    "object"
            ) {
                const value =
                    button as {
                        label?: string;
                        url?: string;
                    };

                return {
                    label:
                        value.label ??
                        `Button ${index + 1}`,
                    url:
                        value.url ??
                        urls[index],
                };
            }

            return null;
        })
        .filter(
            (
                button,
            ): button is ActivityButton =>
                Boolean(
                    button?.label,
                ),
        )
        .slice(0, 2);
}

async function openButton(
    url?: string,
): Promise<void> {
    if (
        !url ||
        !/^https?:\/\//i.test(url)
    ) {
        showToast(
            "This Rich Presence button has no URL",
        );

        return;
    }

    try {
        await ReactNative.Linking.openURL(
            url,
        );
    } catch (error) {
        logger.error(
            `[DBRP] Failed to open URL: ${String(error)}`,
        );

        showToast(
            "Failed to open Rich Presence URL",
        );
    }
}

function createButton(
    button: ActivityButton,
    index: number,
) {
    const {
        TouchableOpacity,
        Text,
    } = ReactNative;

    const validUrl =
        typeof button.url ===
            "string" &&
        /^https?:\/\//i.test(
            button.url,
        );

    return h(
        TouchableOpacity,
        {
            key: `${button.label}-${index}`,
            activeOpacity: 0.7,
            onPress: () =>
                void openButton(
                    button.url,
                ),
            style: {
                flex: 1,
                minHeight: 40,
                borderRadius: 8,
                paddingHorizontal: 12,
                alignItems: "center",
                justifyContent:
                    "center",
                backgroundColor:
                    validUrl
                        ? "#5865F2"
                        : "#4E5058",
            },
        },
        h(
            Text,
            {
                style: {
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight:
                        "600",
                },
                numberOfLines: 1,
            },
            button.label,
        ),
    );
}

function createPresenceView(
    activities: Activity[],
) {
    const {
        View,
        Text,
    } = ReactNative;

    const validActivities =
        activities
            .map((activity) => ({
                activity,
                buttons:
                    getButtons(
                        activity,
                    ),
            }))
            .filter(
                (entry) =>
                    entry.buttons.length >
                    0,
            );

    if (
        validActivities.length ===
        0
    ) {
        return null;
    }

    return h(
        View,
        {
            style: {
                marginTop: 8,
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor:
                    "#97979f0a",
                backgroundColor:
                    "#97979f14",
            },
        },

        ...validActivities.map(
            ({
                activity,
                buttons,
            }, activityIndex) =>
                h(
                    View,
                    {
                        key:
                            activity.id ??
                            activity.application_id ??
                            activityIndex,
                        style: {
                            marginBottom:
                                activityIndex ===
                                validActivities.length -
                                    1
                                    ? 0
                                    : 10,
                        },
                    },

                    h(
                        Text,
                        {
                            style: {
                                color:
                                    "#FFFFFF",
                                fontSize: 15,
                                fontWeight:
                                    "600",
                                marginBottom:
                                    3,
                            },
                            numberOfLines: 1,
                        },
                        activity.name ??
                            "Rich Presence",
                    ),

                    activity.details ||
                    activity.state
                        ? h(
                              Text,
                              {
                                  style: {
                                      color:
                                          "#B5BAC1",
                                      fontSize: 12,
                                      marginBottom:
                                          8,
                                  },
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

                    h(
                        View,
                        {
                            style: {
                                flexDirection:
                                    "row",
                                gap: 8,
                            },
                        },
                        ...buttons.map(
                            (
                                button,
                                index,
                            ) =>
                                createButton(
                                    button,
                                    index,
                                ),
                        ),
                    ),
                ),
        ),
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

function inject(
    node: any,
): {
    node: any;
    changed: boolean;
} {
    if (
        !node ||
        typeof node !== "object"
    ) {
        return {
            node,
            changed: false,
        };
    }

    const typeName =
        getTypeName(node.type);

    if (
        typeName ===
        "UserProfileActivity"
    ) {
        const userId =
            node.props?.user?.id;

        logger.log(
            `[DBRP] Found UserProfileActivity user=${userId}`,
        );

        if (!userId) {
            return {
                node,
                changed: false,
            };
        }

        const activities =
            getActivities(
                String(userId),
            );

        logger.log(
            `[DBRP] Activities: ${JSON.stringify(
                activities,
            )}`,
        );

        const presenceView =
            createPresenceView(
                activities,
            );

        if (!presenceView) {
            logger.log(
                "[DBRP] No activity buttons",
            );

            return {
                node,
                changed: false,
            };
        }

        logger.log(
            "[DBRP] Creating native Rich Presence button view",
        );

        return {
            node: h(
                ReactNative.View,
                {
                    style: {
                        width: "100%",
                    },
                },
                node,
                presenceView,
            ),
            changed: true,
        };
    }

    const props =
        node.props;

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
                (child: any) => {
                    const result =
                        inject(
                            child,
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
            inject(children);

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

class DiscordBetterRichPresenceBar {
    private unpatch:
        Unpatch | null = null;

    private started = false;

    start(): void {
        if (this.started) {
            return;
        }

        this.started = true;

        logger.log(
            "[DBRP] Plugin loaded",
        );

        const UserProfileContent =
            findByTypeName(
                "UserProfileContent",
            );

        if (
            !UserProfileContent
        ) {
            logger.error(
                "[DBRP] UserProfileContent not found",
            );

            return;
        }

        logger.log(
            "[DBRP] UserProfileContent found",
        );

        this.unpatch = after(
            "type",
            UserProfileContent,
            (_args, result) => {
                try {
                    const injected =
                        inject(
                            result,
                        );

                    if (
                        !injected.changed
                    ) {
                        return result;
                    }

                    logger.log(
                        "[DBRP] Rich Presence buttons injected",
                    );

                    return injected.node;
                } catch (error) {
                    logger.error(
                        `[DBRP] Injection failed: ${String(
                            error,
                        )}`,
                    );

                    return result;
                }
            },
        );

        logger.log(
            "[DBRP] UserProfileContent patched",
        );
    }

    stop(): void {
        if (!this.started) {
            return;
        }

        this.started = false;

        try {
            this.unpatch?.();
        } catch (error) {
            logger.error(
                `[DBRP] Unpatch failed: ${String(
                    error,
                )}`,
            );
        }

        this.unpatch = null;

        logger.log(
            "[DBRP] Plugin unloaded",
        );
    }
}

export default new DiscordBetterRichPresenceBar();
