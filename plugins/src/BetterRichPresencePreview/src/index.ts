import { patcher } from "@vendetta";
import { findByDisplayNameAll } from "@vendetta/metro";
import { React, logger } from "@vendetta";

let unpatches: (() => void)[] = [];

export default {
  onLoad: () => {
    const allViews = findByDisplayNameAll("View");

    allViews.forEach(v => {
      if (!v?.prototype) return;
      // patchujemy metodę default/render
      const u = patcher.before("render", v.prototype, (args) => {
        try {
          const wrapper = args[0];
          if (!wrapper?.children) return;

          // szukanie children z activity
          const activity = wrapper.children.find(c => c?.props?.activity || c?.props?.presence);
          if (!activity) return;

          // dodanie custom buttonów pod Rich Presence
          if (!activity.props.children) activity.props.children = [];
          activity.props.children.push(
            React.createElement(
              "button",
              {
                onClick: () => logger.log("Custom button clicked w Rich Presence!"),
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

      unpatches.push(u);
    });

    logger.log("BetterRichPresencePreview: patch applied");
  },

  onUnload: () => {
    unpatches.forEach(u => u());
    unpatches = [];
    logger.log("BetterRichPresencePreview unloaded");
  },
};
