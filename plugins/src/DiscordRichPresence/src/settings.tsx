import { React, ReactNative as RN } from "@vendetta/metro/common";
import { Forms, ErrorBoundary, FormIcon } from "@vendetta/ui/components";
import { useProxy } from "@vendetta/storage";
import { storage } from "@vendetta/plugin";
import { getAssetIDByName } from "@vendetta/ui/assets";
import type { Activity } from "./types";

const { FormInput, FormSection, FormSwitchRow } = Forms;

const Icons = {
  RPC: getAssetIDByName("ic_rich_presence")
};

export default function Settings() {
  useProxy(storage);

  // Bezpieczny fallback
  const activity: Activity = {
    name: storage.name ?? "",
    application_id: storage.application_id ?? "",
    type: storage.type ?? 0,
    details: storage.details ?? "",
    state: storage.state ?? "",
    timestamps: storage.timestamps ?? { _enabled: false, start: Date.now() },
    assets: storage.assets ?? { large_image: "", large_text: "", small_image: "", small_text: "" },
    buttons: storage.buttons ?? [{ label: "", url: "" }, { label: "", url: "" }],
    metadata: storage.metadata ?? {}
  };

  const updateStorage = (key: keyof Activity, value: any) => {
    storage[key] = value;
  };

  return (
    <ErrorBoundary>
      <RN.ScrollView style={{ flex: 1, padding: 16 }}>
        <FormSection title="Basic" titleStyleType="no_border">
          <FormInput
            title="Name"
            placeholder="name"
            value={activity.name}
            leading={<FormIcon source={Icons.RPC} />}
            onChange={v => updateStorage("name", v)}
          />
          <FormInput
            title="Application ID"
            placeholder="Discord Application ID"
            value={activity.application_id}
            onChange={v => updateStorage("application_id", v)}
          />
          <FormInput
            title="Details"
            placeholder="detail"
            value={activity.details}
            onChange={v => updateStorage("details", v)}
          />
          <FormInput
            title="State"
            placeholder="state"
            value={activity.state}
            onChange={v => updateStorage("state", v)}
          />
        </FormSection>

        <FormSection title="Assets" titleStyleType="no_border">
          <FormInput
            title="Large Image Key"
            value={activity.assets.large_image}
            onChange={v => updateStorage("assets", { ...activity.assets, large_image: v })}
          />
          <FormInput
            title="Large Text"
            value={activity.assets.large_text}
            onChange={v => updateStorage("assets", { ...activity.assets, large_text: v })}
          />
          <FormInput
            title="Small Image Key"
            value={activity.assets.small_image}
            onChange={v => updateStorage("assets", { ...activity.assets, small_image: v })}
          />
          <FormInput
            title="Small Text"
            value={activity.assets.small_text}
            onChange={v => updateStorage("assets", { ...activity.assets, small_text: v })}
          />
        </FormSection>

        <FormSection title="Timestamps" titleStyleType="no_border">
          <FormSwitchRow
            label="Enable timestamps"
            value={activity.timestamps._enabled}
            onValueChange={v => updateStorage("timestamps", { ...activity.timestamps, _enabled: v })}
          />
        </FormSection>

        <FormSection title="Buttons" titleStyleType="no_border">
          {activity.buttons.map((b, i) => (
            <RN.View key={i}>
              <FormInput
                title={`Button ${i + 1} Label`}
                placeholder="Label"
                value={b.label}
                onChange={v => {
                  const newButtons = [...activity.buttons];
                  newButtons[i].label = v;
                  updateStorage("buttons", newButtons);
                }}
              />
              <FormInput
                title={`Button ${i + 1} URL`}
                placeholder="https://example.com"
                value={b.url}
                onChange={v => {
                  const newButtons = [...activity.buttons];
                  newButtons[i].url = v;
                  updateStorage("buttons", newButtons);
                }}
              />
            </RN.View>
          ))}
        </FormSection>
      </RN.ScrollView>
    </ErrorBoundary>
  );
                                 }
