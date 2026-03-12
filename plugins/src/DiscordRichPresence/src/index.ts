import { storage, Plugin } from "@vendetta";
import { sendRPC } from "./rpc";
import { RPCActivity } from "./types";

export default class DiscordRichPresence extends Plugin {
  onStart() {
    this.updatePresence();
  }

  onStop() {
    sendRPC({ application_id: "", name: "" }); // reset
  }

  updatePresence() {
    const activity: RPCActivity = {
      application_id: storage.application_id || "1481582227333709844",
      name: storage.name || "Test Name",
      details: storage.details,
      state: storage.state,
      type: 0,
      timestamps: { start: Date.now() },
      assets: storage.assets,
      buttons: storage.buttons,
      metadata: storage.metadata
    };
    sendRPC(activity);
  }
}
