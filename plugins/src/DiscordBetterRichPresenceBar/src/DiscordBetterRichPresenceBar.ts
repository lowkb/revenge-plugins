import { logger, metro } from "@vendetta";

class DiscordBetterRichPresenceBar {
    static start() {
        logger.log("[DBRP] start()");

        const userId = "1459041073136402453";

        try {
            const store = metro.findByProps("getActivities");

            if (!store) {
                logger.error("[DBRP] Activity store not found");
                return;
            }

            logger.log("[DBRP] Activity store found");

            const activities =
                typeof store.getActivities === "function"
                    ? store.getActivities(userId)
                    : null;

            if (!activities || !Array.isArray(activities)) {
                logger.error(
                    `[DBRP] getActivities returned invalid value: ${JSON.stringify(
                        activities,
                    )}`,
                );
                return;
            }

            logger.log(
                `[DBRP] activities: ${JSON.stringify(
                    activities,
                    (_, value) => {
                        if (typeof value === "function") {
                            return "[Function]";
                        }

                        if (typeof value === "bigint") {
                            return value.toString();
                        }

                        return value;
                    },
                )}`,
            );

            const activity = activities[0];

            if (!activity) {
                logger.error("[DBRP] No activity found");
                return;
            }

            logger.log(
                `[DBRP] activity id: ${String(activity.id)}`,
            );

            logger.log(
                `[DBRP] activity keys: ${JSON.stringify(
                    Object.keys(activity),
                )}`,
            );

            const metadata = store.getActivityMetadata;

            logger.log(
                `[DBRP] getActivityMetadata typeof: ${typeof metadata}`,
            );

            if (typeof metadata !== "function") {
                logger.error(
                    "[DBRP] getActivityMetadata is not a function",
                );
                return;
            }

            logger.log(
                `[DBRP] getActivityMetadata.length: ${metadata.length}`,
            );

            logger.log(
                `[DBRP] getActivityMetadata source: ${String(metadata)}`,
            );

            const attempts: Array<[string, unknown]> = [
                ["activity", activity],
                ["activity.id", activity.id],
                ["application_id", activity.application_id],
                ["userId", userId],
            ];

            for (const [name, argument] of attempts) {
                try {
                    const result = metadata.call(store, argument);

                    logger.log(
                        `[DBRP] metadata(${name}) = ${JSON.stringify(
                            result,
                            (_, value) => {
                                if (typeof value === "function") {
                                    return "[Function]";
                                }

                                if (typeof value === "bigint") {
                                    return value.toString();
                                }

                                return value;
                            },
                        )}`,
                    );
                } catch (error) {
                    logger.error(
                        `[DBRP] metadata(${name}) ERROR: ${String(error)}`,
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
