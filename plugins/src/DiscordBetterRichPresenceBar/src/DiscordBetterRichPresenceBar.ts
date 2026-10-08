import { logger, metro } from "@vendetta";

function inspectComponent(name: string) {
    const component = metro.findByName(name);

    if (!component) {
        logger.log(
            `[DiscordBetterRichPresenceBar] ${name}: NOT FOUND`,
        );
        return;
    }

    logger.log(
        `[DiscordBetterRichPresenceBar] ${name}: FOUND`,
    );

    logger.log(
        `[DiscordBetterRichPresenceBar] ${name} keys:`,
        Object.keys(component),
    );

    logger.log(
        `[DiscordBetterRichPresenceBar] ${name} source:`,
        Function.prototype.toString
            .call(component)
            .slice(0, 4000),
    );
}

function start() {
    try {
        inspectComponent("DisplayProfile");
        inspectComponent("UserProfileCard");
        inspectComponent("ActivityStatus");

        logger.log(
            "[DiscordBetterRichPresenceBar] Diagnostic loaded",
        );
    } catch (error) {
        logger.error(
            "[DiscordBetterRichPresenceBar] Diagnostic failed",
            error,
        );
    }
}

function stop() {
    logger.log(
        "[DiscordBetterRichPresenceBar] Diagnostic unloaded",
    );
}

export default {
    start,
    stop,
};
