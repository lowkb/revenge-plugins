import { React, ReactNative } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { Forms } from "@vendetta/ui/components";

const { View, ScrollView } = ReactNative;

const settingsConfig = [
    {
        key: "enabled",
        label: "Enable Better Rich Presence",
        default: true,
        note: "Toggle the custom rich presence feature",
    },
    {
        key: "showJoin",
        label: "Show Join Button",
        default: true,
        note: "Display the 'Join' button for user activities",
    },
];

export default function Settings() {
    useProxy(storage);

    return (
        <ScrollView>
            <View style={{ padding: 10 }}>
                {settingsConfig.map(({ key, label, default: def, note }) => (
                    <Forms.FormSwitchRow
                        key={key}
                        label={label}
                        value={storage[key] ?? def}
                        onValueChange={(v) => (storage[key] = v)}
                        note={note || ""}
                    />
                ))}
            </View>
        </ScrollView>
    );
                                    }
