import { React } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { findByProps } from "@vendetta/metro";

const { FormSwitch, FormSection } = findByProps(
        "FormSwitch",
        "FormSection",
);

export default function Settings() {
        const [enabled, setEnabled] = React.useState(
                storage.enabled ?? true,
        );

        const [showJoin, setShowJoin] = React.useState(
                storage.showJoin ?? true,
        );

        return (
                <FormSection title="Better Rich Presence">
                        <FormSwitch
                                label="Enable plugin"
                                value={enabled}
                                onValueChange={(v: boolean) => {
                                        setEnabled(v);
                                        storage.enabled = v;
                                }}
                        />

                        <FormSwitch
                                label="Show Join button"
                                value={showJoin}
                                onValueChange={(v: boolean) => {
                                        setShowJoin(v);
                                        storage.showJoin = v;
                                }}
                        />
                </FormSection>
        );
}
