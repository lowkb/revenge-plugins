import { logger } from "@vendetta";
import { after } from "@vendetta/patcher";
import {
    findByStoreName,
    findByTypeNameAll,
} from "@vendetta/metro";
import { React, ReactNative } from "@vendetta/metro/common";
import { showToast } from "@vendetta/ui/toasts";

type Unpatch = () => unknown;

interface Activity {
    id?: string;
    application_id?: string;
    name?: string;
    details?: string;
    state?: string;
    buttons?: unknown[];
    metadata?: {
        button_urls?: string[];
    };
}

interface ActivityButton {
    label: string;
    url?: string;
}

interface ProfileProps {
    user?: {
        id?: string;
    };
}

const h = React.createElement;

function getActivities(userId: string): Activity[] {
    try {
        const store = findByStoreName("PresenceStore");

        if (!store || typeof store.getActivities !== "function") {
            logger.error("[DBRP] PresenceStore.getActivities not found");
            return [];
        }

        const result: unknown = store.getActivities(userId);

        return Array.isArray(result)
            ? result as Activity[]
            : [];
    } catch (error) {
        logger.error(`[DBRP] getActivities failed: ${String(error)}`);
        return [];
    }
}

function getButtons(activity: Activity): ActivityButton[] {
    if (!Array.isArray(activity.buttons)) {
        return [];
    }

    const urls = activity.metadata?.button_urls ?? [];

    return activity.buttons
        .map((button, index): ActivityButton | null => {
            if (typeof button === "string") {
                return {
                    label: button,
                    url: urls[index],
                };
            }

            if (button && typeof button === "object") {
                const value = button as {
                    label?: unknown;
                    url?: unknown;
                };

                return {
                    label:
                        typeof value.label === "string" &&
                        value.label.trim()
                            ? value.label
                            : `Button ${index + 1}`,
                    url:
                        typeof value.url === "string"
                            ? value.url
                            : urls[index],
                };
            }

            return null;
        })
        .filter(
            (button): button is ActivityButton =>
                button !== null && button.label.trim().length > 0,
        )
        .slice(0, 2);
}

function isValidUrl(url?: string): url is string {
    return typeof url === "string" && /^https?:\/\/\S+$/i.test(url);
}

async function openButton(url?: string): Promise<void> {
    if (!isValidUrl(url)) {
        showToast("Rich Presence button has no valid URL");
        return;
    }

    try {
        await ReactNative.Linking.openURL(url);
    } catch (error) {
        logger.error(`[DBRP] Failed to open URL: ${String(error)}`);
        showToast("Failed to open Rich Presence URL");
    }
}

function createButton(button: ActivityButton, key: string) {
    const { TouchableOpacity, Text } = ReactNative;
    const validUrl = isValidUrl(button.url);

    return h(
        TouchableOpacity,
        {
            key,
            activeOpacity: 0.7,
            onPress: () => {
                void openButton(button.url);
            },
            style: {
                flex: 1,
                minWidth: 0,
                minHeight: 40,
                borderRadius: 8,
                paddingHorizontal: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: validUrl ? "#5865F2" : "#4E5058",
            },
        },
        h(
            Text,
            {
                style: {
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: "600",
                },
                numberOfLines: 1,
            },
            button.label,
        ),
    );
}

function createPresenceView(activities: Activity[]) {
    const { View, Text } = ReactNative;

    const entries = activities
        .map((activity, index) => ({
            activity,
            buttons: getButtons(activity),
            key:
                activity.id ??
                activity.application_id ??
                `activity-${index}`,
        }))
        .filter((entry) => entry.buttons.length > 0);

    if (entries.length === 0) {
        return null;
    }

    return h(
        View,
        {
            style: {
                width: "100%",
                marginTop: 8,
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "rgba(151,151,159,0.12)",
                backgroundColor: "rgba(151,151,159,0.08)",
            },
        },
        ...entries.map(({ activity, buttons, key }) =>
            h(
                View,
                {
                    key,
                    style: {
                        marginBottom: 10,
                    },
                },
                h(
                    Text,
                    {
                        style: {
                            color: "#FFFFFF",
                            fontSize: 15,
                            fontWeight: "600",
                            marginBottom: 3,
                        },
                        numberOfLines: 1,
                    },
                    activity.name ?? "Rich Presence",
                ),
                activity.details || activity.state
                    ? h(
                          Text,
                          {
                              style: {
                                  color: "#B5BAC1",
                                  fontSize: 12,
                                  marginBottom: 8,
                              },
                              numberOfLines: 2,
                          },
                          [activity.details, activity.state]
                              .filter(Boolean)
                              .join(" • "),
                      )
                    : null,
                h(
                    View,
                    {
                        style: {
                            flexDirection: "row",
                            gap: 8,
                        },
                    },
                    ...buttons.map((button, index) =>
                        createButton(button, `${key}-button-${index}`),
                    ),
                ),
            ),
        ),
    );
}

function findTargets(name: string): any[] {
    try {
        const result = findByTypeNameAll(name);
        return Array.isArray(result) ? result : result ? [result] : [];
    } catch (error) {
        logger.error(`[DBRP] Search for ${name} failed: ${String(error)}`);
        return [];
    }
}

class DiscordBetterRichPresenceBar {
    private unpatches: Unpatch[] = [];
    private started = false;

    start(): void {
        if (this.started) {
            return;
        }

        logger.log("[DBRP] Plugin loading");

        const activityTargets = findTargets("UserProfileActivity");
        const contentTargets = activityTargets.length
            ? []
            : findTargets("UserProfileContent");

        const targets = [
            ...new Set(
                activityTargets.length ? activityTargets : contentTargets,
            ),
        ];

        logger.log(
            `[DBRP] Component search: UserProfileActivity=${activityTargets.length}, UserProfileContent=${contentTargets.length}`,
        );

        if (targets.length === 0) {
            logger.error("[DBRP] No profile component found");
            return;
        }

        for (const target of targets) {
            try {
                const unpatch = after(
                    "type",
                    target,
                    (args, result) => {
                        try {
                            const props = args?.[0] as ProfileProps | undefined;
                            const userId = props?.user?.id;

                            if (!userId) {
                                return result;
                            }

                            const activities = getActivities(String(userId));

                            logger.log(
                                `[DBRP] User ${userId}: ${activities.length} activity(ies)`,
                            );

                            const presenceView = createPresenceView(activities);

                            if (!presenceView) {
                                return result;
                            }

                            logger.log(
                                `[DBRP] Injecting buttons for user ${userId}`,
                            );

                            return h(
                                ReactNative.View,
                                {
                                    style: {
                                        width: "100%",
                                    },
                                },
                                result,
                                presenceView,
                            );
                        } catch (error) {
                            logger.error(
                                `[DBRP] Injection failed: ${String(error)}`,
                            );
                            return result;
                        }
                    },
                );

                this.unpatches.push(unpatch);
            } catch (error) {
                logger.error(
                    `[DBRP] Failed to patch candidate: ${String(error)}`,
                );
            }
        }

        this.started = this.unpatches.length > 0;

        logger.log(`[DBRP] Installed ${this.unpatches.length} patch(es)`);
    }

    stop(): void {
        for (const unpatch of this.unpatches.splice(0)) {
            try {
                unpatch();
            } catch (error) {
                logger.error(`[DBRP] Unpatch failed: ${String(error)}`);
            }
        }

        this.started = false;
        logger.log("[DBRP] Plugin unloaded");
    }
}

export default new DiscordBetterRichPresenceBar();
