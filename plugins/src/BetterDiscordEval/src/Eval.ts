import { runEval } from "./Eval";
import { registerSettingsTile } from "./settingsTile";
import EvalView from "./EvalView";
import { manifest } from "@vendetta/plugin";

export default {
  onLoad() {
    registerSettingsTile({
      key: "BetterDiscordEval",
      title: () => "BetterDiscord Eval",
      page: EvalView,
    });

    // Optional: auto-run code on load
    runEval();
  },

  onUnload() {
    // Nothing special to unload
  },
};
