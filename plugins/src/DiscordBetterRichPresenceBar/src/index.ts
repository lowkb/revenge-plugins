import { logger } from "@vendetta";
import { before, unpatchAll } from "@vendetta/patcher";
import { findByName, findByStoreName } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import Settings from "./settings";

const PresenceStore = findByStoreName("PresenceStore");

let patches: Array<() => void> = [];

function ViewContainer(props: { children: any }) {
        const { ReactNative: RN } = require("@vendetta/metro/common");

        return React.createElement(
                RN.View,
                {
                        style: {
                                padding: 10,
                                flexDirection: "row",
                                gap: 8,
                        },
                },
                props.children,
        );
}

function ActionButton(props: {
        label: string;
        onPress: () => void;
}) {
        const { ReactNative: RN } = require("@vendetta/metro/common");

        return React.createElement(
                RN.TouchableOpacity,
                {
                        onPress: props.onPress,
                        style: {
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 8,
                                backgroundColor: "#5865F2",
                        },
                },
                React.createElement(
                        RN.Text,
                        {
                                style: { color: "white", fontWeight: "600" },
                        },
                        props.label,
                ),
        );
}

function CustomPresence(props: { userId: string }) {
        const [activity, setActivity] = React.useState<any>(null);

        React.useEffect(() => {
                const update = () => {
                        try {
                                const presence = PresenceStore.getPresence(props.userId);
                                setActivity(presence?.activities?.[0] ?? null);
                        } catch (e) {
                                logger.error("CustomPresence", e);
                        }
                };

                update();
                const sub = PresenceStore.addChangeListener(update);
                return () => sub.remove();
        }, [props.userId]);

        if (!activity || storage.enabled === false) return null;

        return React.createElement(
                ViewContainer,
                null,
                React.createElement(ActionButton, {
                        label: "Open",
                        onPress: () => logger.log("Open clicked"),
                }),
                storage.showJoin !== false
                        ? React.createElement(ActionButton, {
                                  label: "Join",
                                  onPress: () => logger.log("Join clicked"),
                          })
                        : null,
        );
}

function patchPresence() {
        const Activity = findByName("Activity");

        if (!Activity) {
                logger.warn("Activity component not found");
                return;
        }

        const patch = before("default", Activity, (args) => {
                const props = args[0];

                if (!props?.user?.id) return;

                const original = props.children;

                props.children = React.createElement(
                        React.Fragment,
                        null,
                        original,
                        React.createElement(CustomPresence, {
                                userId: props.user.id,
                        }),
                );
        });

        patches.push(patch);
}

export default {
        onLoad() {
                logger.log("BetterRichPresence loaded");

                if (storage.enabled === undefined) storage.enabled = true;
                if (storage.showJoin === undefined) storage.showJoin = true;

                patchPresence();
        },

        onUnload() {
                unpatchAll();
                patches = [];
                logger.log("BetterRichPresence unloaded");
        },

        settings: Settings,
};
