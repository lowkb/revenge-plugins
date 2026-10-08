import { logger, metro } from "@vendetta";

const getterNames = [
    "getActivities",
    "getActivity",
    "getActivitiesForUser",
    "getUserActivities",
    "getCurrentUserActivities",
    "getPresence",
    "getPresenceForUser",
    "getPresenceStatus",
    "getStatus",
];

function inspectGetter(name: string) {
    try {
        const module = metro.findByProps(name);

        if (!module) {
            return;
        }

        logger.log(
            `[DiscordBetterRichPresenceBar] FOUND ${name}:`,
            {
                keys: Object.keys(module),
                functions: Object.keys(module).filter(
                    (key) => typeof module[key] === "function",
                ),
            },
        );
    } catch (error) {
        logger.error(
            `[DiscordBetterRichPresenceBar] ${name} failed`,
            error,
        );
    }
}

function scanActivityModules() {
    try {
        const modules = metro.findAll((module: any) => {
            const keys = Object.keys(module);

            return keys.some((key) =>
                /activity|activities|presence/i.test(key),
            );
        });

        logger.log(
            `[DiscordBetterRichPresenceBar] Activity-related modules: ${modules.length}`,
        );

        for (const module of modules.slice(0, 100)) {
            try {
                const keys = Object.keys(module);

                const interesting = keys.filter((key) =>
                    /activity|activities|presence/i.test(key),
                );

                if (interesting.length === 0) {
                    continue;
                }

                logger.log(
                    `[DiscordBetterRichPresenceBar] MODULE:`,
                    {
                        name: module.name,
                        displayName: module.displayName,
                        interesting,
                        functions: interesting.filter(
                            (key) =>
                                typeof module[key] === "function",
                        ),
                    },
                );
            } catch {}
        }
    } catch (error) {
        logger.error(
            "[DiscordBetterRichPresenceBar] module scan failed",
            error,
        );
    }
}

function start() {
    logger.log(
        "[DiscordBetterRichPresenceBar] Store diagnostic started",
    );

    for (const name of getterNames) {
        inspectGetter(name);
    }

    scanActivityModules();
}

function stop() {
    logger.log(
        "[DiscordBetterRichPresenceBar] Store diagnostic stopped",
    );
}

export default {
    start,
    stop,
};
