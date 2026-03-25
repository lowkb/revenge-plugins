import { registerSettingsTile } from "./settingsTile"; // Twój registerSettingsTile
import EvalView from "./EvalView";
import { manifest } from "@vendetta/plugin";

export default {
  onLoad() {
    registerSettingsTile({
      key: "better_eval",
      title: () => "Better Eval",
      icon: "FileIcon", // podmień na odpowiednią ikonę
      page: EvalView
    });
    console.log("[BetterEval] Loaded");
  },
  onUnload() {
    console.log("[BetterEval] Unloaded");
  }
};
