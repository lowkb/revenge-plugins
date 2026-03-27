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
                    label="Hide blocked & ignored users"
                    value={storage.enabled ?? true}
                    onValueChange={(v: boolean) => (storage.enabled = v)}
                />
            </View>
        </ScrollView>
    );
}
