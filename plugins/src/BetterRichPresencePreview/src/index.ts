import { before } from "@vendetta/patcher";
import { findByDisplayName } from "@vendetta/metro";
import { React, logger } from "@vendetta";

export default {
  patch: null as any,

  onLoad() {
    logger.log("BetterRichPresencePreview loaded");

    const ProfileUserActivity = findByDisplayName("ProfileUserActivity");
    if (!ProfileUserActivity) {
      logger.error("Nie znaleziono komponentu Rich Presence w profilu");
      return;
    }

    this.patch = before("default", ProfileUserActivity.prototype, (args, res) => {
      try {
        if (!res?.props) return;

        const presence = res.props.activity || res.props.presence;
        if (!presence || typeof presence.status !== "string") return;

        // Dodanie custom button pod Rich Presence
        if (!res.props.children) res.props.children = [];
        res.props.children.push(
          React.createElement(
            "button",
            {
              onClick: () => logger.log("Custom Rich Presence button clicked!"),
              style: {
                marginTop: 5,
                padding: "2px 6px",
                borderRadius: 4,
                cursor: "pointer",
                backgroundColor: "#5865F2",
                color: "#FFFFFF",
                border: "none",
              },
            },
            "Custom Button"
          )
        );
      } catch (e) {
        logger.error("BetterRichPresencePreview error", e);
      }
    });
  },

  onUnload() {
    if (this.patch) this.patch.unpatch();
    logger.log("BetterRichPresencePreview unloaded");
  },
};
