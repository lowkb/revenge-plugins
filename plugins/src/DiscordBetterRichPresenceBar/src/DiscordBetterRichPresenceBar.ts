import { logger, metro } from "@vendetta";

export default {
  onLoad() {
    try {
      const userId = "1459041073136402453";

      const stores = [
        ["getActivities", metro.findByProps("getActivities")],
        ["getActivity", metro.findByProps("getActivity")],
        ["getStatus", metro.findByProps("getStatus")],
        ["getStreamerActivityByUserId", metro.findByProps("getStreamerActivityByUserId")],
      ];

      for (const [name, store] of stores) {
        if (!store) {
          logger.log(`[ACTIVITY STORE] ${name}: NOT FOUND`);
          continue;
        }

        logger.log(`[ACTIVITY STORE] ${name}: FOUND`);
        logger.log(
          `[ACTIVITY STORE] ${name} keys: ${JSON.stringify(
            Object.keys(store),
          )}`,
        );

        const proto = Object.getPrototypeOf(store);

        if (proto) {
          logger.log(
            `[ACTIVITY STORE] ${name} prototype: ${JSON.stringify(
              Object.getOwnPropertyNames(proto),
            )}`,
          );
        }

        try {
          const fn = store[name];

          logger.log(
            `[ACTIVITY STORE] ${name} typeof: ${typeof fn}`,
          );

          if (typeof fn === "function") {
            const result = fn.call(store, userId);

            logger.log(
              `[ACTIVITY STORE] ${name} result: ${JSON.stringify(
                result,
                (_, value) => {
                  if (typeof value === "bigint") return value.toString();
                  if (typeof value === "function") return "[Function]";
                  return value;
                },
              )}`,
            );
          }
        } catch (error) {
          logger.error(
            `[ACTIVITY STORE] ${name} invocation failed: ${String(error)}`,
          );
        }
      }
    } catch (error) {
      logger.error(`[ACTIVITY STORE] FATAL: ${String(error)}`);
    }
  },
};
