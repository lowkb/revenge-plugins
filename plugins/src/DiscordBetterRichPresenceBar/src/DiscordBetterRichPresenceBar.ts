import { logger, metro, patcher } from "@vendetta";

const targets = [
    "DisplayProfile",
    "UserProfileCard",
    "ActivityStatus",
];

const patches: (() => void)[] = [];

function inspectProps(name: string, props: any) {
    try {
        const result: any = {
            keys: props ? Object.keys(props) : [],
        };

        if (props) {
            for (const key of [
                "user",
                "userId",
                "profile",
                "activities",
                "activity",
                "presence",
                "displayProfile",
                "selectedActivity",
            ]) {
                if (key in props) {
                    result[key] = props[key];
                }
            }
        }

        logger.log(
            `[DiscordBetterRichPresenceBar] ${name} PROPS:`,
            result,
        );
    } catch (error) {
        logger.error(
            `[DiscordBetterRichPresenceBar] ${name} inspect failed`,
            error,
        );
    }
}

function patchFunction(name: string) {
    try {
        const module = metro.findByName(name, false);

        if (!module) {
            logger.log(
                `[DiscordBetterRichPresenceBar] ${name}: raw module NOT FOUND`,
            );
            return;
        }

        logger.log(
            `[DiscordBetterRichPresenceBar] ${name} raw module keys:`,
            Object.keys(module),
        );

        if (typeof module.default !== "function") {
            logger.log(
                `[DiscordBetterRichPresenceBar] ${name}: default export is not a function`,
            );
            return;
        }

        const unpatch = patcher.before(
            "default",
            module,
            (_args: any[]) => {
                inspectProps(name, _args?.[0]);
            },
        );

        patches.push(unpatch);

        logger.log(
            `[DiscordBetterRichPresenceBar] ${name}: patched`,
        );
    } catch (error) {
        logger.error(
            `[DiscordBetterRichPresenceBar] ${name} patch failed`,
            error,
        );
    }
}

function start() {
    for (const target of targets) {
        patchFunction(target);
    }

    logger.log(
        "[DiscordBetterRichPresenceBar] Props diagnostic loaded",
    );
}

function stop() {
    for (const unpatch of patches.splice(0)) {
        try {
            unpatch();
        } catch {}
    }

    logger.log(
        "[DiscordBetterRichPresenceBar] Props diagnostic unloaded",
    );
}

export default {
    start,
    stop,
};
