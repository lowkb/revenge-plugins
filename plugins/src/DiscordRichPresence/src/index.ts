import { FluxDispatcher } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";
import { logger } from "@vendetta";

const assetManager = findByProps("getAssetIds");

const pluginStartSince = Date.now();

async function sendActivity(activity: any | null) {
  if (!activity) {
    FluxDispatcher.dispatch({
      type: "LOCAL_ACTIVITY_UPDATE",
      pid: 1608,
      socketId: "rpc",
      activity: null,
    });
    logger.log("[Rich Presence] Activity cleared");
    return;
  }

  if (activity.timestamps?.start == null) {
    activity.timestamps = { start: pluginStartSince };
  }

  if (activity.assets) {
    try {
      const ids = [activity.assets.large_image, activity.assets.small_image];
      let assetIds = assetManager.getAssetIds(activity.application_id, ids);
      if (!assetIds.length) assetIds = await assetManager.fetchAssetIds(activity.application_id, ids);
      activity.assets.large_image = assetIds[0] ?? activity.assets.large_image;
      activity.assets.small_image = assetIds[1] ?? activity.assets.small_image;
    } catch (e) {
      logger.error("[Rich Presence] Failed to resolve assets:", e);
    }
  }

  if (activity.buttons?.length) {
    const validButtons = activity.buttons.filter((b: any) => b && b.label && b.url);
    if (validButtons.length) {
      activity.metadata = { button_urls: validButtons.map((b: any) => b.url) };
      activity.buttons = validButtons.map((b: any) => b.label);
    } else {
      delete activity.buttons;
    }
  }

  FluxDispatcher.dispatch({
    type: "LOCAL_ACTIVITY_UPDATE",
    pid: 1608,
    socketId: "rpc",
    activity,
  });

  logger.log("[Rich Presence] Activity sent:", activity);
}

export default {
  onLoad() {
    sendActivity({
      application_id: "1481683449885495437",
      name: "Test Name",
      details: "Test Detail",
      state: "Test State",
      type: 0,
      flags: 1 << 0,
      timestamps: { start: Date.now() },
      assets: {
        large_image: "large",
        large_text: "test large",
        small_image: "small",
        small_text: "test small",
      },
      buttons: [
        { label: "button one", url: "https://example.com" },
        { label: "button two", url: "https://example.com" },
      ],
    }).catch(e => logger.error("[Rich Presence] Send failed:", e));
  },

  onUnload() {
    sendActivity(null).catch(e => logger.error("[Rich Presence] Clear failed:", e));
  },
};
