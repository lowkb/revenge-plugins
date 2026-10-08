import { logger, metro } from "@vendetta";

class DiscordBetterRichPresenceBar {
    static start() {
        logger.log("[DBRP] start()");

        try {
            logger.log(`[DBRP] metro = ${typeof metro}`);
            logger.log(
                `[DBRP] findByProps = ${typeof metro?.findByProps}`,
            );

            if (typeof metro?.findByProps !== "function") {
                logger.error("[DBRP] metro.findByProps is unavailable");
                return;
            }

            const userId = "1459041073136402453";

            const names = [
                "getActivities",
                "getActivity",
                "getStatus",
                "getStreamerActivityByUserId",
            ];

            for (const name of names) {
                try {
                    const store = metro.findByProps(name);

                    logger.log(
                        `[DBRP] ${name}: ${
                            store ? "FOUND" : "NOT FOUND"
                        }`,
                    );

                    if (!store) continue;

                    logger.log(
                        `[DBRP] ${name} keys: ${JSON.stringify(
                            Object.keys(store),
                        )}`,
                    );

                    const proto = Object.getPrototypeOf(store);

                    logger.log(
                        `[DBRP] ${name} prototype: ${
                            proto
                                ? JSON.stringify(
                                      Object.getOwnPropertyNames(proto),
                                  )
                                : "null"
                        }`,
                    );

                    const fn = store[name];

                    logger.log(
                        `[DBRP] ${name} typeof: ${typeof fn}`,
                    );

                    if (typeof fn !== "function") {
                        continue;
                    }

                    const result = fn.call(store, userId);

                    logger.log(
                        `[DBRP] ${name} result: ${JSON.stringify(
                            result,
                            (_, value) => {
                                if (typeof value === "bigint") {
                                    return value.toString();
                                }

                                if (typeof value === "function") {
                                    return "[Function]";
                                }

                                return value;
                            },
                        )}`,
                    );
                } catch (error) {
                    logger.error(
                        `[DBRP] ${name} ERROR: ${String(error)}`,
                    );
                }
            }
        } catch (error) {
            logger.error(
                `[DBRP] start() FATAL: ${String(error)}`,
            );
        }
    }

    static stop() {
        logger.log("[DBRP] stop()");
    }
}

export default DiscordBetterRichPresenceBar;
