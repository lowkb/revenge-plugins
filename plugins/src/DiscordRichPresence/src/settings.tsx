import { Forms, General } from "@vendetta/ui/components";
import { storage } from "@vendetta";
import type { Settings as S } from "./types";

export default () => {
  const update = (key: keyof S, value: any) => storage[key] = value;

  return (
    <General.Section title="Discord Rich Presence Settings">
      <Forms.Text label="Application ID" defaultValue={storage.application_id || ""} onChange={v => update("application_id", v)} />
      <Forms.Text label="Name" defaultValue={storage.name || ""} onChange={v => update("name", v)} />
      <Forms.Text label="Details" defaultValue={storage.details || ""} onChange={v => update("details", v)} />
      <Forms.Text label="State" defaultValue={storage.state || ""} onChange={v => update("state", v)} />
      <Forms.Text label="Type" defaultValue={storage.state || ""} onChange={v => update("state", v)} />
      <Forms.Text label="Large Image Key" defaultValue={storage.assets?.large_image || ""} onChange={v => storage.assets = { ...(storage.assets || {}), large_image: v }} />
      <Forms.Text label="Large Image Text" defaultValue={storage.assets?.large_text || ""} onChange={v => storage.assets = { ...(storage.assets || {}), large_text: v }} />
      <Forms.Text label="Small Image Key" defaultValue={storage.assets?.small_image || ""} onChange={v => storage.assets = { ...(storage.assets || {}), small_image: v }} />
      <Forms.Text label="Small Image Text" defaultValue={storage.assets?.small_text || ""} onChange={v => storage.assets = { ...(storage.assets || {}), small_text: v }} />
      <Forms.Text label="Button 1 Label" defaultValue={storage.buttons?.[0] || ""} onChange={v => storage.buttons = [v, storage.buttons?.[1] || ""]} />
      <Forms.Text label="Button 1 URL" defaultValue={storage.metadata?.button_urls?.[0] || ""} onChange={v => storage.metadata = { button_urls: [v, storage.metadata?.button_urls?.[1] || ""] }} />
      <Forms.Text label="Button 2 Label" defaultValue={storage.buttons?.[1] || ""} onChange={v => storage.buttons = [storage.buttons?.[0] || "", v]} />
      <Forms.Text label="Button 2 URL" defaultValue={storage.metadata?.button_urls?.[1] || ""} onChange={v => storage.metadata = { button_urls: [storage.metadata?.button_urls?.[0] || "", v] }} />
    </General.Section>
  );
};
