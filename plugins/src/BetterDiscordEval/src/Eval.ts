
import { storage } from "@vendetta/plugin";
import { findByProps } from "@vendetta/metro";

const util = findByProps("inspect");

export async function runEval(code: string): Promise<string> {
  try {
    const res = eval(`${code}//# sourceURL=BetterEval`);
    const final = storage.awaitResult ? await res : res;
    return util.inspect(final, { showHidden: storage.showHidden ?? false });
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  }
}
