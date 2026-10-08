import { logger, metro } from "@vendetta";

function inspectModules() {
    const matches = metro.findAll(
        (module: any) => {
            const displayName =
                typeof module?.displayName === "string"
                    ? module.displayName
                    : "";

            const name =
                typeof module?.name === "string"
                    ? module.name
                    : "";

            const text = `${displayName} ${name}`.toLowerCase();

            return (
                text.includes("activity") ||
                text.includes("presence") ||
                text.includes("profile") ||
                text.includes("user")
            );
        },
    );

    logger.log(
        `[DiscordBetterRichPresenceBar] Found ${matches.length} candidate modules`,
    );

    for (const module of matches.slice(0, 100)) {
        try {
            logger.log(
                "[DiscordBetterRichPresenceBar] Candidate:",
                {
                    displayName: module?.displayName,
                    name: module?.name,
                    type: typeof module,
                },
            );
        } catch {
        }
    }
}

const start = () => {
    try {
        inspectModules();
        logger.log("[DiscordBetterRichPresenceBar] Diagnostic loaded");
    } catch (error) {
        logger.error(
            "[DiscordBetterRichPresenceBar] Diagnostic failed",
            error,
        );
    }
};

const stop = () => {
    logger.log("[DiscordBetterRichPresenceBar] Diagnostic unloaded");
};

export default {
    start,
    stop,
};
