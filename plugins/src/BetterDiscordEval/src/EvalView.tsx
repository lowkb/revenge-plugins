import { React, ReactNative } from "@vendetta/metro/common";
import { Forms } from "@vendetta/ui/components";
import { useProxy } from "@vendetta/storage";
import { storage } from "@vendetta/plugin";
import { logger } from "@vendetta";
const { FormInput, FormSection, FormSwitchRow } = Forms;

export default function EvalView() {
  logger.log("evalview")
  useProxy(storage);

  storage.code ??= "";

  return (
    <ReactNative.ScrollView style={{ flex: 1, padding: 16 }}>
      <FormSection title="Eval" titleStyleType="no_border">
        <FormInput
          title="JS Code"
          value={storage.code}
          onChange={(v) => (storage.code = v)}
          placeholder="Enter JavaScript code to eval"
          multiline
        />
      </FormSection>
    </ReactNative.ScrollView>
  );
}
