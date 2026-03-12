import { FluxDispatcher } from "@vendetta/metro/common";
import { logger } from "@vendetta";

let interval: NodeJS.Timer;

export default {
  onLoad() {
    logger.log("AlwaysActive plugin loaded");
    
    interval = setInterval(() => {
      FluxDispatcher.dispatch({
        type: "IDLE",
        idle: false
      });
      logger.log("Sent active heartbeat to prevent idle");
    }, 20000);
  },

  onUnload() {
    clearInterval(interval);
    logger.log("AlwaysActive plugin unloaded");
  }
};
