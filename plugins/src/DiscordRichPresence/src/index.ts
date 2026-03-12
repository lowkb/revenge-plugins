import { FluxDispatcher } from "@vendetta/metro/common";

const PID = 1608;

export default {
  onLoad() {
    FluxDispatcher.dispatch({
      type: "LOCAL_ACTIVITY_UPDATE",
      pid: PID,
      socketId: "rpc",
      activity: {
        application_id: "1481582227333709844",
        name: "Test Name",
        details: "Test Detail",
        state: "Test State",
        type: 0,
        flags: 0,
        timestamps: {
      _enabled: false,
      start: Date.now(),
    },
        assets: {
          large_image: "large",
          large_text: "test large",
          small_image: "small",
          small_text: "test small"
        },
        buttons: ["button one", "button two"],
        metadata: {
          button_urls: [
            "https://example.com",
            "https://example.com"
          ]
        }
      }
    });
  },

  onUnload() {
    FluxDispatcher.dispatch({
      type: "LOCAL_ACTIVITY_UPDATE",
      pid: PID,
      socketId: "rpc",
      activity: { name: "", type: 0 }
    });
  }
};
