
const unpatches: (() => unknown)[] = [];
let started = false;

const DiscordBetterRichPresenceBar = {
    start(): void {
        if (started || unpatches.length > 0) return;

        logger.log("[DBRP] Plugin loading");

        const activityTargets = findTargets("UserProfileActivity");
        const contentTargets = activityTargets.length
            ? []
            : findTargets("UserProfileContent");

        const targets = [
            ...new Set(
                activityTargets.length
                    ? activityTargets
                    : contentTargets,
            ),
        ];

        logger.log(
            `[DBRP] Component search: UserProfileActivity=${activityTargets.length}, UserProfileContent=${contentTargets.length}`,
        );

        if (!targets.length) {
            logger.error("[DBRP] No profile component found");
            return;
        }

        for (const target of targets) {
            try {
                const unpatch = after(
                    "type",
                    target,
                    (args: unknown[], result: unknown) => {
                        try {
                            const props = args?.[0] as
                                | ProfileProps
                                | undefined;
                            const userId = props?.user?.id;

                            if (!userId) return result;

                            const activities = getActivities(String(userId));

                            logger.log(
                                `[DBRP] User ${userId}: ${activities.length} activity(ies)`,
                            );

                            const view = createPresenceView(activities);
                            if (!view) return result;

                            return h(
                                ReactNative.View,
                                { style: { width: "100%" } },
                                result,
                                view,
                            );
                        } catch (error) {
                            logger.error(
                                `[DBRP] Injection failed: ${String(error)}`,
                            );
                            return result;
                        }
                    },
                );

                if (typeof unpatch === "function") {
                    unpatches.push(unpatch);
                }
            } catch (error) {
                logger.error(
                    `[DBRP] Failed to patch candidate: ${String(error)}`,
                );
            }
        }

        started = unpatches.length > 0;
        logger.log(`[DBRP] Installed ${unpatches.length} patch(es)`);
    },

    stop(): void {
        logger.log("[DBRP] Plugin unloading");

        while (unpatches.length > 0) {
            const unpatch = unpatches.pop();

            try {
                if (typeof unpatch === "function") unpatch();
            } catch (error) {
                logger.error(`[DBRP] Unpatch failed: ${String(error)}`);
            }
        }

        started = false;
        logger.log("[DBRP] Plugin unloaded");
    },
};

export default DiscordBetterRichPresenceBar;
