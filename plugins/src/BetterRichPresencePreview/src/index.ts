import { logger } from "@vendetta";
const bunny = window.bunny.api.react.jsx;

export default {
  onLoad: () => {
    logger.log("RichPresencePreview loaded");

    bunny.onJsxCreate("*", (component, ret) => {
      // Zabezpieczenie przed undefined
      if (!component && !ret) return;

      // Nazwa komponentu (displayName lub nazwa funkcji/klasy)
      const name = component?.displayName || component?.name || "unknown";

      // Log propsów, jeśli są
      const props = ret?.props ? JSON.stringify(ret.props) : "{}";

      logger.log(`[JSX CREATE] Component: ${name}`, props);

      return ret; // zawsze zwracaj ret, żeby klient nie crashował
    });
  },

  onUnload: () => {
    logger.log("RichPresencePreview unloaded");
  },
};
