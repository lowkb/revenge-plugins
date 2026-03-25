import { React, ReactNative as RN } from "@vendetta/metro/common";
import { Button, TextArea, Stack, TableRowGroup, TableSwitchRow } from "@vendetta/ui/components";
import { useProxy } from "@vendetta/storage";
import { storage } from "@vendetta/plugin";
import { runEval } from "./Eval";

export default function EvalView() {
  useProxy(storage);

  const [code, setCode] = React.useState("");
  const [result, setResult] = React.useState("undefined");
  const [running, setRunning] = React.useState(false);

  async function onRun() {
    setRunning(true);
    try {
      const res = await runEval(code);
      setResult(res);
    } catch (e) {
      setResult(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  }

  return RN.ScrollView({
    contentContainerStyle: { padding: 16 },
    children: Stack({
      spacing: 16,
      children: [
        TextArea({
          placeholder: "Enter JS code...",
          value: code,
          onChange: setCode,
          numberOfLines: 6,
        }),
        TableRowGroup({
          children: [
            TableSwitchRow({
              label: "Await result",
              value: storage.awaitResult ?? false,
              onValueChange: v => (storage.awaitResult = v),
            }),
            TableSwitchRow({
              label: "Show hidden",
              value: storage.showHidden ?? false,
              onValueChange: v => (storage.showHidden = v),
            }),
          ],
        }),
        Button({
          text: running ? "Running..." : "Evaluate",
          onPress: onRun,
          loading: running,
        }),
        TextArea({
          value: result,
          editable: false,
          numberOfLines: 8,
        }),
      ],
    }),
  });
}
