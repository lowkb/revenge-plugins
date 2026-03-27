import { FluxDispatcher } from "@vendetta/metro/common";
import { patcher, logger } from "@vendetta";

export default {
  patch: null as any,

  onLoad() {
    logger.log("AlwaysActive plugin loaded");

    this.patch = patcher.before(
      "dispatch",
      FluxDispatcher,
      ([event]: [{ type: string; idle?: boolean }]) => {
        if (event.type !== "IDLE") return;

        logger.log("Patched IDLE event -> forcing active", event);
        return [{ ...event, idle: false }];
      }
    );
  },

  onUnload() {
    if (this.patch) this.patch.unpatch();
    logger.log("AlwaysActive plugin unloaded");
  }
};
