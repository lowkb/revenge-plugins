import { logger } from "@vendetta";
const bunny = window.bunny.api.react.jsx;

export default {
  onLoad: () => {
    logger.log("RichPresencePreview loaded");

    // Patch wszystkich JSX-ów
    bunny.onJsxCreate("*", (component, ret) => {
      if (!ret || !ret.props) return ret;

      // jeśli komponent ma właściwość 'activities', logujemy ją
      if (ret.props.activities) {
        logger.log(
          `Found Rich Presence in component ${component.displayName || "unknown"}`,
          ret.props.activities
        );
        // dla wygody możemy trzymać w globalu
        window.lastRichPresence = ret.props.activities;
      }
      return ret;
    });
  },

  onUnload: () => {
    logger.log("RichPresencePreview unloaded");
  },
};
