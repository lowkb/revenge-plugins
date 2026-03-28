import { logger } from "@vendetta";
import { patcher } from "@vendetta/patcher";
import { findByName, findByTypeName, findByStoreName } from "@vendetta/metro";
import { findInReactTree } from "@vendetta/utils";
import { React } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import Settings from "./settings";

const PresenceStore = findByStoreName("PresenceStore");

let unpatches: Array<() => void> = [];

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

function patchUserProfile() {
        const UserProfileContent = findByTypeName("UserProfileContent");
        if (!UserProfileContent) return;

        unpatches.push(
                patcher.after("type", UserProfileContent, (_, res) => {
                        const userId = findInReactTree(
                                res,
                                (m) => m?.props?.user?.id,
                        )?.props?.user?.id;

                        if (!userId) return;

                        const primary = findInReactTree(
                                res,
                                (c) => c?.type?.name === "UserProfilePrimaryInfo",
                        );

                        if (!primary) return;

                        patcher.after("type", primary, (_, res2) => {
                                if (!res2?.props?.children) return;

                                if (
                                        findInReactTree(
                                                res2,
                                                (c) => c?.key === "BetterRPC",
                                        )
                                )
                                        return;

                                res2.props.children.push(
                                        React.createElement(CustomPresence, {
                                                key: "BetterRPC",
                                                userId,
                                        }),
                                );
                        });
                }),
        );
}

function patchDMHeader() {
        const ChannelHeader = findByName("ChannelHeader", false);
        if (!ChannelHeader) return;

        unpatches.push(
                patcher.after("default", ChannelHeader, (_, res) => {
                        if (!(res?.type?.type?.name === "PrivateChannelHeader"))
                                return;

                        patcher.after("type", res.type, (_, res2) => {
                                const userId = findInReactTree(
                                        res2,
                                        (m) => m?.props?.user?.id,
                                )?.props?.user?.id;

                                if (!userId) return;

                                if (
                                        findInReactTree(
                                                res2,
                                                (c) => c?.key === "BetterRPC",
                                        )
                                )
                                        return;

                                const container = res2?.props?.children;
                                if (!container?.props?.children) return;

                                container.props.children.push(
                                        React.createElement(CustomPresence, {
                                                key: "BetterRPC",
                                                userId,
                                        }),
                                );
                        });
                }),
        );
}

export default {
        onLoad() {
                logger.log("BetterRichPresence loaded");

                if (storage.enabled === undefined) storage.enabled = true;
                if (storage.showJoin === undefined) storage.showJoin = true;

                patchUserProfile();
                patchDMHeader();
        },

        onUnload() {
                unpatches.forEach((u) => u());
                unpatches = [];
                logger.log("BetterRichPresence unloaded");
        },

        settings: Settings,
};
