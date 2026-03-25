import { React, ReactNative as RN } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";
import { Stack, Button, TableRowGroup, TableSwitchRow, TextArea } from "@vendetta/ui/components";
import { useProxy } from "@vendetta/storage";
import { storage } from "@vendetta/plugin";

const util = findByProps("inspect");

export function EvalPage() {
  useProxy(storage);

  const [code, setCode] = React.useState("");
  const [result, setResult] = React.useState("undefined");

  return RN.ScrollView({
    contentContainerStyle: { padding: 16 },
    children: Stack({
      spacing: 16,
      children: [
        TextArea({
          placeholder: "Enter JS code...",
          value: code,
          onChange: setCode,
        }),
        TableRowGroup({
          children: [
            TableSwitchRow({
              label: "Await result",
              value: storage.awaitResult,
              onValueChange: (v) => (storage.awaitResult = v),
            }),
            TableSwitchRow({
              label: "Show hidden",
              value: storage.showHidden,
              onValueChange: (v) => (storage.showHidden = v),
            }),
          ],
        }),
        Button({
          text: "Evaluate",
          onPress: async function () {
            try {
              const res = eval(`${code}//# sourceURL=BetterEval`);
              const final = storage.awaitResult ? await res : res;
              setResult(util.inspect(final, { showHidden: storage.showHidden }));
            } catch (e) {
              setResult(util.inspect(e));
            }
          },
        }),
        TextArea({
          value: result,
          editable: false,
        }),
      ],
    }),
  });
}

export default {
  onLoad() {
    console.log("[BetterEval] Loaded");
  },
  onUnload() {
    console.log("[BetterEval] Unloaded");
  },
};
