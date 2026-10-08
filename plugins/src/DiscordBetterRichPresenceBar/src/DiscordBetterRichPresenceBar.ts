import { logger, metro, patcher } from "@vendetta";

const targets = [
    "PresenceActivityStatus",
    "ActivityStatus",
    "ApplicationStreamActivityStatus",
    "ActivityStatusText",
    "ActivityStatusIcon",
];

const patches: (() => void)[] = [];

function simplify(value: any, depth = 0): any {
    if (depth > 4) return "[MaxDepth]";

    if (value === null || value === undefined) {
        return value;
    }

    if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
    ) {
        return value;
    }

    if (typeof value === "function") {
        return `[Function ${value.name || "anonymous"}]`;
    }

    if (Array.isArray(value)) {
        return value.map((item) => simplify(item, depth + 1));
    }

    if (typeof value === "object") {
        const result: Record<string, any> = {};

        for (const key of Object.keys(value)) {
            try {
                result[key] = simplify(value[key], depth + 1);
            } catch {
                result[key] = "[Unreadable]";
            }
        }

        return result;
    }

    return `[${typeof value}]`;
}

function patchFunction(name: string) {
    try {
        const module = metro.findByName(name, false);

        if (!module || typeof module.default !== "function") {
            logger.log(
                `[DiscordBetterRichPresenceBar] ${name}: unavailable`,
            );
            return;
        }

        const unpatch = patcher.before(
            "default",
            module,
            (args: any[]) => {
                try {
                    logger.log(
                        `[DiscordBetterRichPresenceBar] ${name} PROPS:`,
                        simplify(args?.[0]),
                    );
                } catch (error) {
                    logger.error(
                        `[DiscordBetterRichPresenceBar] ${name} logger failed`,
                        error,
                    );
                }
            },
        );

        patches.push(unpatch);

        logger.log(
            `[DiscordBetterRichPresenceBar] ${name}: patched`,
        );
    } catch (error) {
        logger.error(
            `[DiscordBetterRichPresenceBar] ${name}: patch failed`,
            error,
        );
    }
}

function start() {
    for (const target of targets) {
        patchFunction(target);
    }

    logger.log(
        "[DiscordBetterRichPresenceBar] Activity diagnostic loaded",
    );
}

function stop() {
    for (const unpatch of patches.splice(0)) {
        try {
            unpatch();
        } catch {}
    }

    logger.log(
        "[DiscordBetterRichPresenceBar] Activity diagnostic unloaded",
    );
}

export default {
    start,
    stop,
};
