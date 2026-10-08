import { logger, metro } from "@vendetta";

const names = [
    "USER_PROFILE_ACTIVITY_BUTTONS",
    "USER_PROFILE_LIVE_ACTIVITY_CARD",
    "USER_PROFILE_RECENT_ACTIVITY_CARD",
    "NOW_PLAYING_ITEM_RICH_PRESENCE_SECTION",
];

function start() {
    for (const name of names) {
        try {
            const modules = metro.findAll((module: any) => {
                try {
                    return Object.prototype.hasOwnProperty.call(
                        module,
                        name,
                    );
                } catch {
                    return false;
                }
            });

            logger.log(
                `[DiscordBetterRichPresenceBar] ${name}: ${modules.length} matches`,
            );

            for (const module of modules) {
                logger.log(
                    `[DiscordBetterRichPresenceBar] ${name} MODULE:`,
                    {
                        moduleName: module?.name,
                        displayName: module?.displayName,
                        keys: Object.keys(module),
                        target: module?.[name],
                    },
                );
            }
        } catch (error) {
            logger.error(
                `[DiscordBetterRichPresenceBar] ${name} scan failed`,
                error,
            );
        }
    }
}

function stop() {
    logger.log(
        "[DiscordBetterRichPresenceBar] Profile activity scan stopped",
    );
}

export default {
    start,
    stop,
};
