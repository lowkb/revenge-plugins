import { logger, metro } from "@vendetta";

class DiscordBetterRichPresenceBar {
    static start() {
        logger.log("[DBRP] start()");

        try {
            const userId = "1459041073136402453";
            const store = metro.findByProps("getActivities");

            if (!store) {
                logger.error("[DBRP] Activity store not found");
                return;
            }

            const activities = store.getActivities(userId);

            logger.log(
                `[DBRP] activities: ${JSON.stringify(activities)}`,
            );

            const metadata = store.getActivityMetadata;

            logger.log(
                `[DBRP] getActivityMetadata typeof: ${typeof metadata}`,
            );

            if (typeof metadata !== "function") {
                return;
            }

            for (const activity of activities ?? []) {
                try {
                    const result = metadata.call(store, activity);

                    logger.log(
                        `[DBRP] metadata(${activity.name}): ${JSON.stringify(
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
                        `[DBRP] metadata(${activity.name}) ERROR: ${String(error)}`,
                    );
                }
            }
        } catch (error) {
            logger.error(
                `[DBRP] FATAL: ${String(error)}`,
            );
        }
    }

    static stop() {
        logger.log("[DBRP] stop()");
    }
}

export default DiscordBetterRichPresenceBar;
