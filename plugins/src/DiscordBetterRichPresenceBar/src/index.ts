declare const bunny: {
    api: {
        patcher: {
            after(
                func: string,
                parent: any,
                callback: (
                    args: any[],
                    ret: any
                ) => any
            ): () => unknown;
        };
    };

    metro: {
        findByName(
            name: string,
            expDefault?: boolean
        ): any;

        common: {
            React: any;
            ReactNative: any;
        };
    };
};

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

const findByName = (name: string) => {
    const result = bunny.metro.findByName(name);

    if (!result) {
        throw new Error(`${name} not found`);
    }

    return result;
};

const getCurrentUserId = (): string | undefined => {
    try {
        return findByName("UserStore")
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
                url
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
            bunny.metro.findByName("url");

        if (urlModule?.openURL) {
            await urlModule.openURL(url);
            return;
        }
    } catch {}

    if (
        typeof globalThis !== "undefined" &&
        "window" in globalThis
    ) {
        const currentWindow =
            (globalThis as any).window;

        currentWindow?.open?.(url);
    }
};

const createButton = (
    label: string,
    url: string,
    index: number
) => {
    const {
        React,
        ReactNative
    } = bunny.metro.common;

    const Button =
        bunny.metro.findByName("Button");

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
                marginBottom: 8
            }
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
                borderRadius: 6
            }
        },
        React.createElement(
            ReactNative.Text,
            null,
            label
        )
    );
};

const createButtons = (
    activity: Activity
) => {
    const buttons =
        getActivityButtons(activity);

    if (!buttons.length) {
        return null;
    }

    const {
        React,
        ReactNative
    } = bunny.metro.common;

    return React.createElement(
        ReactNative.View,
        {
            style: {
                flexDirection: "row",
                flexWrap: "wrap",
                marginTop: 8
            }
        },
        buttons.map(
            ({ label, url }, index) =>
                createButton(
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

    const unpatch =
        bunny.api.patcher.after(
            "render",
            ActivityContainer.prototype,
            function (
                _: unknown[],
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
                            Array.isArray(
                                children
                            )
                                ? [
                                      ...children,
                                      buttons
                                  ]
                                : [
                                      children,
                                      buttons
                                  ]
                    }
                };
            }
        );

    patches.push(unpatch);
};

export default {
    start() {
        try {
            patchActivityContainer();
        } catch (error) {
            console.error(
                "[DiscordBetterRichPresenceBar]",
                error
            );
        }
    },

    stop() {
        for (
            const unpatch of patches.splice(
                0
            )
        ) {
            try {
                unpatch();
            } catch {}
        }
    }
};
