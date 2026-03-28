import { Forms } from "@vendetta/ui/components";
import { storage } from "@vendetta/plugin";
import React from "react";

export default function Settings() {
  return (
    <>
      <Forms.FormRow title="Enable Rich Presence on Profile">
        <Forms.FormSwitchRow
          label="Rich Presence"
          value={storage.profileRichPresence ?? true}
          onValueChange={(val) => (storage.profileRichPresence = val)}
        />
      </Forms.FormRow>

      <Forms.FormRow title="Enable Status Icons on Profile">
        <Forms.FormSwitchRow
          label="Status Icons"
          value={storage.profileUsername ?? true}
          onValueChange={(val) => (storage.profileUsername = val)}
        />
      </Forms.FormRow>
    </>
  );
}
