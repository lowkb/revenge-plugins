import { React, ReactNative } from "@vendetta/metro/common";
import { Forms } from "@vendetta/ui/components";
import { storage } from "@vendetta";

const { View, ScrollView } = ReactNative;
const { FormText, FormSection } = Forms;

export default () => {
  const update = (key: string, value: any) => storage[key] = value;

  return (
    <ScrollView>
      <FormSection title="Discord Rich Presence Settings">
        <FormText label="Application ID" defaultValue={storage.application_id || ""} onChangeText={v => update("application_id", v)} />
        <FormText label="Name" defaultValue={storage.name || ""} onChangeText={v => update("name", v)} />
        <FormText label="Details" defaultValue={storage.details || ""} onChangeText={v => update("details", v)} />
        <FormText label="State" defaultValue={storage.state || ""} onChangeText={v => update("state", v)} />
        <FormText label="type" defaultValue={storage.type || ""} onChangeText={v => update("type", v)} />
        <FormText label="Large Image Key" defaultValue={storage.assets?.large_image || ""} onChangeText={v => storage.assets = { ...(storage.assets || {}), large_image: v }} />
        <FormText label="Large Image Text" defaultValue={storage.assets?.large_text || ""} onChangeText={v => storage.assets = { ...(storage.assets || {}), large_text: v }} />
        <FormText label="Small Image Key" defaultValue={storage.assets?.small_image || ""} onChangeText={v => storage.assets = { ...(storage.assets || {}), small_image: v }} />
        <FormText label="Small Image Text" defaultValue={storage.assets?.small_text || ""} onChangeText={v => storage.assets = { ...(storage.assets || {}), small_text: v }} />
        <FormText label="Button 1 Label" defaultValue={storage.buttons?.[0] || ""} onChangeText={v => storage.buttons = [v, storage.buttons?.[1] || ""]} />
        <FormText label="Button 1 URL" defaultValue={storage.metadata?.button_urls?.[0] || ""} onChangeText={v => storage.metadata = { button_urls: [v, storage.metadata?.button_urls?.[1] || ""] }} />
        <FormText label="Button 2 Label" defaultValue={storage.buttons?.[1] || ""} onChangeText={v => storage.buttons = [storage.buttons?.[0] || "", v]} />
        <FormText label="Button 2 URL" defaultValue={storage.metadata?.button_urls?.[1] || ""} onChangeText={v => storage.metadata = { button_urls: [storage.metadata?.button_urls?.[0] || "", v] }} />
      </FormSection>
    </ScrollView>
  );
};
