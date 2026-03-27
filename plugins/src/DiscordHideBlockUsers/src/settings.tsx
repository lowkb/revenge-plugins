import { React, ReactNative } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { Forms } from "@vendetta/ui/components";

const { View, ScrollView } = ReactNative;

export default function Settings() {
    useProxy(storage);

    return (
        <ScrollView>
            <View>
                <Forms.FormSwitchRow
                    label="Enable hiding"
                    value={storage.enabled ?? true}
                    onValueChange={(v: boolean) => (storage.enabled = v)}
                />

                <Forms.FormSwitchRow
                    label="Hide blocked users"
                    value={storage.blocked ?? true}
                    onValueChange={(v: boolean) => (storage.blocked = v)}
                />

                <Forms.FormSwitchRow
                    label="Hide ignored users"
                    value={storage.ignored ?? true}
                    onValueChange={(v: boolean) => (storage.ignored = v)}
                />

                <Forms.FormSwitchRow
                    label="Hide replies to blocked/ignored"
                    value={storage.removeReplies ?? true}
                    onValueChange={(v: boolean) => (storage.removeReplies = v)}
                />
            </View>
        </ScrollView>
    );
}
