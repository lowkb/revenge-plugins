import { React, ReactNative } from "@vendetta/metro/common";
import { Forms } from "@vendetta/ui/components";
import { useProxy } from "@vendetta/storage";
import { storage } from "@vendetta/plugin";

const { FormInput, FormSection, FormSwitchRow } = Forms;

export default function Settings() {
  useProxy(storage);

  storage.name ??= "Test Name";
  storage.application_id ??= "1481582227333709844";
  storage.details ??= "Test Detail";
  storage.state ??= "Test State";
  storage.type ??= 0;

  storage.timestampsEnabled ??= true;
  storage.timestampStart ??= Date.now();

  storage.assets ??= {};
  storage.assets.large_image ??= "large";
  storage.assets.large_text ??= "test large";
  storage.assets.small_image ??= "small";
  storage.assets.small_text ??= "test small";

  storage.buttons ??= ["Button One", "Button Two"];
  storage.metadata ??= {};
  storage.metadata.button_urls ??= [
    "https://example.com",
    "https://example.com"
  ];

  return (
    <ReactNative.ScrollView style={{ flex: 1, padding: 16 }}>
      <FormSection title="Basic" titleStyleType="no_border">
        <FormInput
          title="Name"
          value={storage.name}
          onChange={v => (storage.name = v)}
        />

        <FormInput
          title="Application ID"
          value={storage.application_id}
          onChange={v => (storage.application_id = v)}
        />

        <FormInput
          title="Details"
          value={storage.details}
          onChange={v => (storage.details = v)}
        />

        <FormInput
          title="State"
          value={storage.state}
          onChange={v => (storage.state = v)}
        />
      </FormSection>

      <FormSection title="Assets" titleStyleType="no_border">
        <FormInput
          title="Large Image Key"
          value={storage.assets.large_image}
          onChange={v =>
            (storage.assets = { ...storage.assets, large_image: v })
          }
        />

        <FormInput
          title="Large Text"
          value={storage.assets.large_text}
          onChange={v =>
            (storage.assets = { ...storage.assets, large_text: v })
          }
        />

        <FormInput
          title="Small Image Key"
          value={storage.assets.small_image}
          onChange={v =>
            (storage.assets = { ...storage.assets, small_image: v })
          }
        />

        <FormInput
          title="Small Text"
          value={storage.assets.small_text}
          onChange={v =>
            (storage.assets = { ...storage.assets, small_text: v })
          }
        />
      </FormSection>

      <FormSection title="Timestamps" titleStyleType="no_border">
        <FormSwitchRow
          label="Enable timestamps"
          value={storage.timestampsEnabled}
          onValueChange={v => (storage.timestampsEnabled = v)}
        />
      </FormSection>

      <FormSection title="Buttons" titleStyleType="no_border">
        <FormInput
          title="Button 1 Label"
          value={storage.buttons[0]}
          onChange={v => {
            const arr = [...storage.buttons];
            arr[0] = v;
            storage.buttons = arr;
          }}
        />

        <FormInput
          title="Button 1 URL"
          value={storage.metadata.button_urls[0]}
          onChange={v => {
            const arr = [...storage.metadata.button_urls];
            arr[0] = v;
            storage.metadata = { button_urls: arr };
          }}
        />

        <FormInput
          title="Button 2 Label"
          value={storage.buttons[1]}
          onChange={v => {
            const arr = [...storage.buttons];
            arr[1] = v;
            storage.buttons = arr;
          }}
        />

        <FormInput
          title="Button 2 URL"
          value={storage.metadata.button_urls[1]}
          onChange={v => {
            const arr = [...storage.metadata.button_urls];
            arr[1] = v;
            storage.metadata = { button_urls: arr };
          }}
        />
      </FormSection>
    </ReactNative.ScrollView>
  );
    }
