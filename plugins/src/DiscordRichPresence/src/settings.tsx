import { React, ReactNative } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { ErrorBoundary, Forms } from "@vendetta/ui/components";

const { FormInput, FormSection, FormSwitchRow, FormIcon } = Forms;

const Icons = {
    RPC: getAssetIDByName("GameControllerIcon")
};

const typedStorage = storage as typeof storage & {
    selected: string;
    selections: Record<string, Activity>;
};

export default () => {
    useProxy(typedStorage);

    const activity = typedStorage.selections[typedStorage.selected];

    if (!activity) {
        typedStorage.selected = "default";
        typedStorage.selections.default = {
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

    return (
        <ErrorBoundary>
            <ReactNative.ScrollView style={{ flex: 1 }}>

                <FormSection title="Basic" titleStyleType="no_border">
                    <FormInput
                        title="Name"
                        placeholder="Reveg©"
                        value={activity.name}
                        leading={<FormIcon source={Icons.RPC} />}
                        onChange={v => activity.name = v}
                    />

                    <FormInput
                        title="Application ID"
                        placeholder="1054951789318909972"
                        value={activity.application_id}
                        onChange={v => activity.application_id = v}
                    />

                    <FormInput
                        title="Details"
                        placeholder="Competitive"
                        value={activity.details}
                        onChange={v => activity.details = v}
                    />

                    <FormInput
                        title="State"
                        placeholder="Playing Solo"
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
                        <React.Fragment key={i}>

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

                        </React.Fragment>
                    ))}

                </FormSection>

            </ReactNative.ScrollView>
        </ErrorBoundary>
    );
};
