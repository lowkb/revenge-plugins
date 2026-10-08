import { logger, metro, patcher } from "@vendetta";

type Activity = {
    id?: string;
    application_id?: string;
    name?: string;
    buttons?: string[];
};

type Patch = () => void;

class DiscordBetterRichPresenceBar {
    private static unpatches: Patch[] = [];

    private static getCurrentUserId(): string | null {
        try {
            const userStore =
                metro.findByProps("getCurrentUserId") ??
                metro.findByProps("getCurrentUser");

            if (!userStore) {
                return null;
            }

            if (typeof userStore.getCurrentUserId === "function") {
                const id = userStore.getCurrentUserId();

                if (id) {
                    return String(id);
                }
            }

            if (typeof userStore.getCurrentUser === "function") {
                const user = userStore.getCurrentUser();

                if (user?.id) {
                    return String(user.id);
                }
            }
        } catch {}

        return null;
    }

    private static getActivities(userId: string): Activity[] {
        try {
            const store = metro.findByProps("getActivities");

            if (!store || typeof store.getActivities !== "function") {
                return [];
            }

            const activities = store.getActivities(userId);

            return Array.isArray(activities)
                ? activities
                : [];
        } catch {
            return [];
        }
    }

    private static getButtonUrl(
        activity: Activity,
        index: number,
    ): string | null {
        try {
            const launchStore =
                metro.findByProps("getActivityLaunchURL");

            if (
                launchStore &&
                typeof launchStore.getActivityLaunchURL ===
                    "function"
            ) {
                const fn = launchStore.getActivityLaunchURL;

                const attempts = [
                    () => fn.call(launchStore, activity, index),
                    () =>
                        fn.call(
                            launchStore,
                            activity,
                            activity.buttons?.[index],
                            index,
                        ),
                    () =>
                        fn.call(
                            launchStore,
                            activity.id,
                            index,
                        ),
                    () =>
                        fn.call(
                            launchStore,
                            activity.application_id,
                            index,
                        ),
                ];

                for (const attempt of attempts) {
                    try {
                        const result = attempt();

                        if (typeof result === "string") {
                            return result;
                        }

                        if (
                            result &&
                            typeof result === "object"
                        ) {
                            const object = result as Record<
                                string,
                                unknown
                            >;

                            if (
                                typeof object.url ===
                                "string"
                            ) {
                                return object.url;
                            }

                            if (
                                typeof object.button_url ===
                                "string"
                            ) {
                                return object.button_url;
                            }
                        }
                    } catch {}
                }
            }
        } catch {}

        return null;
    }

    private static createButtons(
        activity: Activity,
    ) {
        const React = metro.common.React;
        const ReactNative = metro.common.ReactNative;

        if (!React || !ReactNative) {
            return null;
        }

        const buttons = activity.buttons;

        if (!Array.isArray(buttons) || buttons.length === 0) {
            return null;
        }

        const {
            View,
            Text,
            TouchableOpacity,
        } = ReactNative;

        const url = metro.common.url;

        if (!View || !Text || !TouchableOpacity) {
            return null;
        }

        const children = buttons.map(
            (label, index) => {
                const buttonUrl =
                    this.getButtonUrl(
                        activity,
                        index,
                    );

                return React.createElement(
                    TouchableOpacity,
                    {
                        key: `${activity.id ?? "activity"}-button-${index}`,
                        disabled: !buttonUrl,
                        activeOpacity: 0.7,
                        onPress: () => {
                            if (!buttonUrl) {
                                return;
                            }

                            try {
                                if (
                                    url &&
                                    typeof url.openURL ===
                                        "function"
                                ) {
                                    url.openURL(
                                        buttonUrl,
                                    );
                                }
                            } catch (error) {
                                logger.error(
                                    `[DBRP] Failed to open URL: ${String(
                                        error,
                                    )}`,
                                );
                            }
                        },
                        style: {
                            flex: 1,
                            minHeight: 40,
                            paddingHorizontal: 12,
                            borderRadius: 8,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor:
                                "#5865F2",
                            marginLeft:
                                index > 0 ? 6 : 0,
                        },
                    },
                    React.createElement(
                        Text,
                        {
                            style: {
                                color: "#FFFFFF",
                                fontSize: 14,
                                fontWeight: "600",
                            },
                            numberOfLines: 1,
                        },
                        label,
                    ),
                );
            },
        );

        return React.createElement(
            View,
            {
                style: {
                    width: "100%",
                    flexDirection: "row",
                    paddingHorizontal: 12,
                    paddingTop: 8,
                    paddingBottom: 4,
                },
            },
            ...children,
        );
    }

    private static patchActivityDisplays() {
        const module =
            metro.findByName(
                "UserProfileActivityDisplays",
                false,
            );

        if (!module) {
            throw new Error(
                "UserProfileActivityDisplays not found",
            );
        }

        const target =
            typeof module === "function"
                ? { default: module }
                : module;

        if (typeof target.default !== "function") {
            throw new Error(
                "UserProfileActivityDisplays.default is not a function",
            );
        }

        const unpatch = patcher.after(
            target,
            "default",
            (
                _,
                args,
                result,
            ) => {
                try {
                    const props =
                        args?.[0] ?? {};

                    const currentUserId =
                        this.getCurrentUserId();

                    const profileUserId =
                        props.userId ??
                        props.user?.id ??
                        props.user?.userId;

                    if (
                        !currentUserId ||
                        !profileUserId ||
                        String(profileUserId) !==
                            String(currentUserId)
                    ) {
                        return result;
                    }

                    const activities =
                        this.getActivities(
                            String(currentUserId),
                        );

                    const activity =
                        activities.find(
                            (item) =>
                                Array.isArray(
                                    item.buttons,
                                ) &&
                                item.buttons.length >
                                    0,
                        );

                    if (!activity) {
                        return result;
                    }

                    const buttons =
                        this.createButtons(
                            activity,
                        );

                    if (!buttons) {
                        return result;
                    }

                    const React =
                        metro.common.React;

                    if (!React) {
                        return result;
                    }

                    return React.createElement(
                        React.Fragment,
                        null,
                        result,
                        buttons,
                    );
                } catch (error) {
                    logger.error(
                        `[DBRP] Render patch error: ${String(
                            error,
                        )}`,
                    );

                    return result;
                }
            },
        );

        this.unpatches.push(unpatch);

        logger.log(
            "[DBRP] UserProfileActivityDisplays patched",
        );
    }

    static start() {
        logger.log("[DBRP] start()");

        try {
            this.patchActivityDisplays();
        } catch (error) {
            logger.error(
                `[DBRP] Failed to patch activity UI: ${String(
                    error,
                )}`,
            );
        }
    }

    static stop() {
        for (const unpatch of this.unpatches) {
            try {
                unpatch();
            } catch {}
        }

        this.unpatches = [];

        logger.log("[DBRP] stop()");
    }
}

export default DiscordBetterRichPresenceBar;
