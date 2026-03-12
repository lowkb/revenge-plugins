import { FluxDispatcher } from "@vendetta/metro/common";
import { logger } from "@vendetta";

let interval: NodeJS.Timer;

function getRandomInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default {
  onLoad() {
    logger.log("AlwaysActive plugin loaded");

    const sendHeartbeat = () => {
      FluxDispatcher.dispatch({
        type: "IDLE",
        idle: false
      });
      logger.log("Sent active heartbeat to prevent idle");

      // ustaw następny heartbeat w losowym czasie 15–30 sekund
      interval = setTimeout(sendHeartbeat, getRandomInterval(15000, 30000));
    };

    // rozpocznij pierwsze wysyłanie
    sendHeartbeat();
  },

  onUnload() {
    clearTimeout(interval);
    logger.log("AlwaysActive plugin unloaded");
  }
};
