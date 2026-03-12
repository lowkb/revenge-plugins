import { React } from "@vendetta/metro/common";
import { ScrollView } from "react-native";
import { FormTextRow, FormSection, FormSelectRow } from "@vendetta/ui/components/Forms";
import { storage } from "@vendetta";
import { ActivityTypes } from "./types";

export default function Settings() {
  const update = (key: string, value: any) => storage[key] = value;

  if (!storage.application_id) storage.application_id = "1481582227333709844";
  if (!storage.name) storage.name = "Test Name";
  if (!storage.details) storage.details = "Test Detail";
  if (!storage.state) storage.state = "Test State";
  if (!storage.type) storage.type = 0;
  if (!storage.assets) storage.assets = { large_image: "large", large_text: "test large", small_image: "small", small_text: "test small" };
  if (!storage.buttons) storage.buttons = ["Button 1", "Button 2"];
  if (!storage.metadata) storage.metadata = { button_urls: ["https://example.com","https://example.com"] };

  return (
    <ScrollView>
      <FormSection title="Discord Rich Presence Settings">
        <FormTextRow label="Application ID" defaultValue={storage.application_id} onChangeText={v => update("application_id", v)} />
        <FormTextRow label="Name" defaultValue={storage.name} onChangeText={v => update("name", v)} />
        <FormTextRow label="Details" defaultValue={storage.details} onChangeText={v => update("details", v)} />
        <FormTextRow label="State" defaultValue={storage.state} onChangeText={v => update("state", v)} />
        <FormSelectRow label="Type" options={ActivityTypes} value={storage.type} onValueChange={v => update("type", v)} />
        <FormTextRow label="Large Image Key" defaultValue={storage.assets.large_image} onChangeText={v => storage.assets = { ...storage.assets, large_image: v }} />
        <FormTextRow label="Large Image Text" defaultValue={storage.assets.large_text} onChangeText={v => storage.assets = { ...storage.assets, large_text: v }} />
        <FormTextRow label="Small Image Key" defaultValue={storage.assets.small_image} onChangeText={v => storage.assets = { ...storage.assets, small_image: v }} />
        <FormTextRow label="Small Image Text" defaultValue={storage.assets.small_text} onChangeText={v => storage.assets = { ...storage.assets, small_text: v }} />
        <FormTextRow label="Button 1 Label" defaultValue={storage.buttons[0]} onChangeText={v => storage.buttons = [v, storage.buttons[1]]} />
        <FormTextRow label="Button 1 URL" defaultValue={storage.metadata.button_urls[0]} onChangeText={v => storage.metadata = { button_urls: [v, storage.metadata.button_urls[1]] }} />
        <FormTextRow label="Button 2 Label" defaultValue={storage.buttons[1]} onChangeText={v => storage.buttons = [storage.buttons[0], v]} />
        <FormTextRow label="Button 2 URL" defaultValue={storage.metadata.button_urls[1]} onChangeText={v => storage.metadata = { button_urls: [storage.metadata.button_urls[0], v] }} />
      </FormSection>
    </ScrollView>
  );
                                             }
