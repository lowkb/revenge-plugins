import { React, ReactNative as RN } from "@vendetta/metro/common";
import { Forms, ErrorBoundary, FormIcon } from "@vendetta/ui/components";
import { useProxy } from "@vendetta/storage";
import { storage } from "@vendetta/plugin";
import { getAssetIDByName } from "@vendetta/ui/assets";

const { FormInput, FormSection, FormSwitchRow } = Forms;

const typedStorage = storage as typeof storage & {
    selected: string;
    selections: Record<string, import("./index").Activity>;
};

const Icons = {
    RPC: getAssetIDByName("ic_rich_presence")
};

export default function Settings() {
    useProxy(typedStorage);

    // Bezpieczny fallback
    if (!typedStorage.selected) typedStorage.selected = "default";
    if (!typedStorage.selections) typedStorage.selections = {};
    if (!typedStorage.selections[typedStorage.selected]) {
        typedStorage.selections[typedStorage.selected] = {
            name: "",
            application_id: "",
            type: 0,
            details: "",
            state: "",
            timestamps: { _enabled: false, start: Date.now() },
            assets: { large_image: "", large_text: "", small_image: "", small_text: "" },
            buttons: [{ label: "", url: "" }, { label: "", url: "" }]
        };
    }

    const activity = typedStorage.selections[typedStorage.selected];

    return (
        <ErrorBoundary>
            <RN.ScrollView style={{ flex: 1, padding: 16 }}>
                <FormSection title="Basic" titleStyleType="no_border">
                    <FormInput
                        title="Name"
                        placeholder="name"
                        value={activity.name}
                        leading={<FormIcon source={Icons.RPC} />}
                        onChange={v => activity.name = v}
                    />
                    <FormInput
                        title="Application ID"
                        placeholder="Discord Application ID"
                        value={activity.application_id}
                        onChange={v => activity.application_id = v}
                    />
                    <FormInput
                        title="Details"
                        placeholder="detail"
                        value={activity.details}
                        onChange={v => activity.details = v}
                    />
                    <FormInput
                        title="State"
                        placeholder="state"
                        value={activity.state}
                        onChange={v => activity.state = v}
                    />
                </FormSection>

                <FormSection title="Assets" titleStyleType="no_border">
                    <FormInput
                        title="Large Image Key"
                        value={activity.assets.large_image}
                        onChange={v => activity.assets.large_image = v}
                    />
                    <FormInput
                        title="Large Text"
                        value={activity.assets.large_text}
                        onChange={v => activity.assets.large_text = v}
                    />
                    <FormInput
                        title="Small Image Key"
                        value={activity.assets.small_image}
                        onChange={v => activity.assets.small_image = v}
                    />
                    <FormInput
                        title="Small Text"
                        value={activity.assets.small_text}
                        onChange={v => activity.assets.small_text = v}
                    />
                </FormSection>

                <FormSection title="Timestamps" titleStyleType="no_border">
                    <FormSwitchRow
                        label="Enable timestamps"
                        value={activity.timestamps._enabled}
                        onValueChange={v => activity.timestamps._enabled = v}
                    />
                </FormSection>

                <FormSection title="Buttons" titleStyleType="no_border">
                    {activity.buttons.map((b, i) => (
                        <RN.View key={i} style={{ marginBottom: 8 }}>
                            <FormInput
                                title={`Button ${i + 1} Label`}
                                placeholder="Label"
                                value={b.label}
                                onChange={v => b.label = v}
                            />
                            <FormInput
                                title={`Button ${i + 1} URL`}
                                placeholder="https://example.com"
                                value={b.url}
                                onChange={v => b.url = v}
                            />
                        </RN.View>
                    ))}
                </FormSection>
            </RN.ScrollView>
        </ErrorBoundary>
    );
}
