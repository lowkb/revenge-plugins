import { FluxDispatcher } from "@vendetta/metro/common";

let interval;

export default {
  onLoad() {
    interval = setInterval(() => {
      FluxDispatcher.dispatch({
        type: "IDLE",
        idle: false
      });
    }, 20000);
  },

  onUnload() {
    clearInterval(interval);
  }
};
