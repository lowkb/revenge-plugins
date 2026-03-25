import { React, ReactNative } from "@vendetta/metro/common";
import { Codeblock, Stack, Button, TextArea } from "@vendetta/ui/components";
import { storage } from "@vendetta/plugin";
import { findByProps } from "@vendetta/metro";

const util = findByProps("inspect");

export function EvalPage() {
  const [code, setCode] = React.useState("");
  const [result, setResult] = React.useState("undefined");

  return (
    <ReactNative.ScrollView contentContainerStyle={{ padding: 16 }}>
      <Stack spacing={16}>
        <TextArea
          placeholder="Wpisz kod do eval"
          onChange={(v) => setCode(v)}
        />

        <Button
          text="Evaluate"
          onPress={async function () {
            try {
              let res = (0, eval)(`${code}//# sourceURL=BetterEval`);
              if (storage.awaitResult) res = await res;

              // Render React element live lub string/obiekt w Codeblock
              if (typeof res === "object" && res?.$$typeof) {
                setResult(res); // React element renderuje się live
              } else {
                setResult(util.inspect(res, { showHidden: storage.showHidden }));
              }
            } catch (e) {
              setResult(util.inspect(e));
            }
          }}
        />

        {typeof result === "object" && result?.$$typeof
          ? result
          : <Codeblock>{result}</Codeblock>}
      </Stack>
    </ReactNative.ScrollView>
  );
}

export default {
  onLoad() {
    // nic nie trzeba
  },
  onUnload() {
    // nic nie trzeba
  },
};
