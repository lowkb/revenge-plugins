import { Forms } from "@vendetta/ui/components";
import { storage } from "@vendetta/plugin";
import { React } from "@vendetta/metro/common";

const Settings = () => {
    return (
        <Forms.FormSection title="Hide Blocked & Ignored Messages">
            <Forms.FormRow
                label="Hide blocked/ignored messages"
                trailing={
                    <Forms.FormSwitch
                        value={storage.hideBlocked ?? true}
                        onValueChange={(v) => (storage.hideBlocked = v)}
                    />
                }
            />
        </Forms.FormSection>
    );
};

export default Settings;
