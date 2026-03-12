import { storage, logger } from "@vendetta";
import Settings from "./settings";
import { sendRPC } from "./rpc";
import type { Activity } from "./types";

export default {
  onLoad() {
    logger.log("Discord rich presents on");
    sendRPC({
      application_id: storage.application_id,
      name: storage.name,
      details: storage.details,
      state: storage.state,
      type: storage.type,
      timestamps: { start: Date.now() },
      assets: storage.assets,
      buttons: storage.buttons,
      metadata: storage.metadata
    });
  },
  onUnload() {
        logger.log("Discord rich presents off");
    sendRPC({ application_id: "", name: "" });
  },
  settings: Settings
};
