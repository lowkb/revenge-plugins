
import { React, ReactNative } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { Forms } from "@vendetta/ui/components";

const { View, ScrollView } = ReactNative;

export default function Settings() {
    useProxy(storage);

    storage.blocked ??= true;
    storage.ignored ??= true;

    return (
        <ScrollView>
            <View>
                <Forms.FormSwitchRow
                    label="Remove blocked messages"
                    value={storage.blocked}
                    onValueChange={(v) => (storage.blocked = v)}
                    note=""
                />
                <Forms.FormSwitchRow
                    label="Remove ignored messages"
                    value={storage.ignored}
                    onValueChange={(v) => (storage.ignored = v)}
                    note=""
                />
            </View>
        </ScrollView>
    );
}
