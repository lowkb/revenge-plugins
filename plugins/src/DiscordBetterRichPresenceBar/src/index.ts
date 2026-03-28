import { logger } from "@vendetta";
import { before, unpatchAll } from "@vendetta/patcher";
import { findByName, findByStoreName } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import Settings from "./settings";

const PresenceStore = findByStoreName("PresenceStore");

let patches: Array<() => void> = [];

function CustomPresence({ userId }: { userId: string }) {
        const [activity, setActivity] = React.useState<any>(null);

        React.useEffect(() => {
                const update = () => {
                        try {
                                const presence = PresenceStore.getPresence(userId);
                                setActivity(presence?.activities?.[0] ?? null);
                        } catch (e) {
                                logger.error("CustomPresence", e);
                        }
                };

                update();
                const sub = PresenceStore.addChangeListener(update);
                return () => sub.remove();
        }, [userId]);

        if (!activity) return null;

        return (
                <ViewContainer>
                        <ActionButton
                                label="Open"
                                onPress={() => logger.log("Open clicked")}
                        />
                        <ActionButton
                                label="Join"
                                onPress={() => logger.log("Join clicked")}
                        />
                </ViewContainer>
        );
}

function ViewContainer({ children }: { children: React.ReactNode }) {
        const { ReactNative: RN } = require("@vendetta/metro/common");

        return (
                <RN.View
                        style={{
                                padding: 10,
                                flexDirection: "row",
                                gap: 8,
                        }}
                >
                        {children}
                </RN.View>
        );
}

function ActionButton({
        label,
        onPress,
}: {
        label: string;
        onPress: () => void;
}) {
        const { ReactNative: RN } = require("@vendetta/metro/common");

        return (
                <RN.TouchableOpacity
                        onPress={onPress}
                        style={{
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 8,
                                backgroundColor: "#5865F2",
                        }}
                >
                        <RN.Text style={{ color: "white", fontWeight: "600" }}>
                                {label}
                        </RN.Text>
                </RN.TouchableOpacity>
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

                props.children = (
                        <>
                                {original}
                                <CustomPresence userId={props.user.id} />
                        </>
                );
        });

        patches.push(patch);
}

export default {
        onLoad() {
                logger.log("Custom RPC UI loaded");
                patchPresence();
        },

        onUnload() {
                unpatchAll();
                patches = [];
                logger.log("Custom RPC UI unloaded");
        },

        settings: Settings,
};
