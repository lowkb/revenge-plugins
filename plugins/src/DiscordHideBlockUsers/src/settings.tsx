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
                    label="Hide messages from blocked/ignored users"
                    value={storage.hideMessages ?? true}
                    onValueChange={(v) => (storage.hideMessages = v)}
                />
            </View>
        </ScrollView>
    );
}
