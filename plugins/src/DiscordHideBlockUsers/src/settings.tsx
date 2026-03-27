import { React, ReactNative } from "@vendetta/metro/common";
import { Forms } from "@vendetta/ui/components";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";

const { View, ScrollView } = ReactNative;

export default function Settings() {
    useProxy(storage);

    return (
        <ScrollView>
            <View>
                <Forms.FormSwitchRow
                    label="Hide blocked users messages"
                    value={storage.hideBlocked ?? true}
                    onValueChange={(v) => (storage.hideBlocked = v)}
                />
            </View>
        </ScrollView>
    );
}
