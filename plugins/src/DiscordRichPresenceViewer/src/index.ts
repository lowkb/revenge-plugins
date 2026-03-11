import { logger } from "@vendetta";
import { FluxDispatcher, React, ReactNative } from "@vendetta/metro/common";

const { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } = ReactNative;

// Pobranie store'ów runtime
const UserStore = (globalThis as any).findByProps("getCurrentUser");
const ActivityStore = (globalThis as any).findByProps("getActivities", "getActivity");

// userId aktualnie zalogowanego użytkownika
const myUserId = UserStore.getCurrentUser().id;

export default {
    onLoad() {
        logger.log("[RPC UI] Plugin loaded");

        const RichPresencePanel = () => {
            const [activity, setActivity] = React.useState(
                ActivityStore.getActivities(myUserId)?.find((a: any) => a.type === 0 || a.type === 4) || null
            );

            React.useEffect(() => {
                const listener = () => {
                    const act = ActivityStore.getActivities(myUserId)?.find((a: any) => a.type === 0 || a.type === 4) || null;
                    setActivity(act);
                };
                ActivityStore.addChangeListener(listener);
                return () => ActivityStore.removeChangeListener(listener);
            }, []);

            if (!activity) return React.createElement(Text, null, "Brak Rich Presence");

            return React.createElement(ScrollView, { style: styles.container },
                React.createElement(View, { style: styles.section },
                    React.createElement(Text, { style: styles.title }, activity.name),
                    React.createElement(Text, { style: styles.subtitle }, activity.details),
                    React.createElement(Text, { style: styles.subtitle }, activity.state)
                ),
                React.createElement(View, { style: styles.assets },
                    activity.assets.large_image && React.createElement(Image, { style: styles.largeImage, source: { uri: activity.assets.large_image } }),
                    activity.assets.small_image && React.createElement(Image, { style: styles.smallImage, source: { uri: activity.assets.small_image } })
                ),
                React.createElement(View, { style: styles.buttons },
                    (activity.buttons || []).map((b: any, i: number) =>
                        React.createElement(TouchableOpacity, { key: i, onPress: () => logger.log("Button clicked:", b), style: styles.button },
                            React.createElement(Text, { style: styles.buttonText }, b.label)
                        )
                    )
                )
            );
        };

        // W runtime możesz go np. podpiąć do overlay, tutaj logujemy gotowy element
        const element = React.createElement(RichPresencePanel);
        console.log("Rich Presence Panel gotowy:", element);
    },
    onUnload() {}
};

// Style
const styles = StyleSheet.create({
    container: { padding: 16, flex: 1 },
    section: { marginBottom: 12 },
    title: { fontSize: 16, fontWeight: "bold" },
    subtitle: { fontSize: 14, color: "#aaa" },
    assets: { flexDirection: "row", marginBottom: 12 },
    largeImage: { width: 64, height: 64, marginRight: 8 },
    smallImage: { width: 32, height: 32 },
    buttons: { flexDirection: "row", flexWrap: "wrap" },
    button: { padding: 8, backgroundColor: "#7289da", borderRadius: 6, marginRight: 8, marginBottom: 8 },
    buttonText: { color: "#fff" }
});
