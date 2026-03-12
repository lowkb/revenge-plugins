import { FluxDispatcher } from "@vendetta/metro/common";

export default {
  onLoad() {
    FluxDispatcher.dispatch({
      type: "LOCAL_ACTIVITY_UPDATE",
      pid: 1608,
      socketId: "rpc",
      activity: {
        application_id: "1481683449885495437",
        name: "Test Name",
        details: "Test Detail",
        state: "Test State",
        type: 0,
        flags: 1 << 0,
        timestamps: {
          start: Date.now()
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
      pid: 1608,
      socketId: "rpc",
      activity: { name:"", type:0 }
    });
  }
};
