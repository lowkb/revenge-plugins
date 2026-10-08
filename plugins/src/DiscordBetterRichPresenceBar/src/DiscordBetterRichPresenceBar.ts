import { after, before } from "@vendetta/patcher";
import {
    findByProps,
    findByStoreName,
} from "@vendetta/metro";
import { logger } from "@vendetta";
import { React, ReactNative } from "@vendetta/metro/common";

type Unpatch = () => unknown;

const patches: Unpatch[] = [];

const loggedObjects = new WeakSet<object>();
const loggedCalls = new Set<string>();

const ACTIVITY_NAMES = [
    "activity",
    "activities",
    "presence",
    "richPresence",
    "userActivities",
    "application",
    "applications",
];

const METHOD_NAMES = [
    "getActivity",
    "getActivities",
    "getUserActivities",
    "getPresence",
    "getPresenceForUser",
    "getUserPresence",
    "getUserActivity",
    "getActivitiesForUser",
    "getPresenceForUserId",
    "getUser",
    "getUserById",
];

function log(
    message: string,
    ...args: unknown[]
): void {
    logger.log(
        `[DiscordBetterRichPresenceBar] ${message}`,
        ...args,
    );
}

function error(
    message: string,
    ...args: unknown[]
): void {
    logger.error(
        `[DiscordBetterRichPresenceBar] ${message}`,
        ...args,
    );
}

function serialize(
    value: any,
    depth = 0,
    seen = new WeakSet<object>(),
): string {
    if (value === null) {
        return "null";
    }

    if (value === undefined) {
        return "undefined";
    }

    if (typeof value === "string") {
        return JSON.stringify(value);
    }

    if (
        typeof value === "number" ||
        typeof value === "boolean" ||
        typeof value === "bigint"
    ) {
        return String(value);
    }

    if (typeof value === "function") {
        return `[Function ${value.name || "anonymous"}]`;
    }

    if (typeof value !== "object") {
        return String(value);
    }

    if (seen.has(value)) {
        return "[Circular]";
    }

    if (depth >= 3) {
        return `[${value.constructor?.name || "Object"}]`;
    }

    seen.add(value);

    if (Array.isArray(value)) {
        const items = value
            .slice(0, 20)
            .map((item) =>
                serialize(
                    item,
                    depth + 1,
                    seen,
                ),
            );

        if (value.length > 20) {
            items.push(
                `... ${value.length - 20} more`,
            );
        }

        return `[${items.join(", ")}]`;
    }

    const entries: string[] = [];

    for (const key of Object.keys(value).slice(0, 50)) {
        try {
            entries.push(
                `${key}: ${serialize(
                    value[key],
                    depth + 1,
                    seen,
                )}`,
            );
        } catch {
            entries.push(
                `${key}: [Unreadable]`,
            );
        }
    }

    return `{ ${entries.join(", ")} }`;
}

function getKeys(
    value: any,
): string[] {
    if (
        !value ||
        typeof value !== "object"
    ) {
        return [];
    }

    try {
        return Object.keys(value);
    } catch {
        return [];
    }
}

function logModule(
    name: string,
    module: any,
): void {
    if (
        !module ||
        typeof module !== "object"
    ) {
        return;
    }

    if (loggedObjects.has(module)) {
        return;
    }

    loggedObjects.add(module);

    const keys = getKeys(module);

    log(
        `${name} found`,
    );

    log(
        `${name} keys: ${keys.join(", ")}`,
    );

    const interesting = keys.filter(
        (key) =>
            ACTIVITY_NAMES.some((name) =>
                key.toLowerCase().includes(name),
            ) ||
            METHOD_NAMES.includes(key),
    );

    if (interesting.length > 0) {
        log(
            `${name} interesting keys: ${interesting.join(", ")}`,
        );
    }
}

function patchMethod(
    moduleName: string,
    module: any,
    methodName: string,
): void {
    if (
        !module ||
        typeof module[methodName] !== "function"
    ) {
        return;
    }

    const callId =
        `${moduleName}.${methodName}`;

    if (loggedCalls.has(callId)) {
        return;
    }

    loggedCalls.add(callId);

    log(
        `Patching ${callId}`,
    );

    patches.push(
        before(
            methodName,
            module,
            (args) => {
                try {
                    log(
                        `${callId}() args: ${serialize(args)}`,
                    );
                } catch (e) {
                    error(
                        `${callId} args dump failed: ${String(e)}`,
                    );
                }

                return args;
            },
        ),
    );

    patches.push(
        after(
            methodName,
            module,
            (args, result) => {
                try {
                    const serialized =
                        serialize(result);

                    if (
                        serialized.includes("activity") ||
                        serialized.includes("Activity") ||
                        serialized.includes("application") ||
                        serialized.includes("Application") ||
                        serialized.includes("spotify") ||
                        serialized.includes("discord")
                    ) {
                        log(
                            `${callId}() RESULT: ${serialized}`,
                        );
                    }
                } catch (e) {
                    error(
                        `${callId} result dump failed: ${String(e)}`,
                    );
                }

                return result;
            },
        ),
    );
}

function inspectStore(
    storeName: string,
): void {
    try {
        const store =
            findByStoreName(storeName);

        if (!store) {
            log(
                `${storeName} not found`,
            );

            return;
        }

        logModule(
            storeName,
            store,
        );

        for (const method of METHOD_NAMES) {
            patchMethod(
                storeName,
                store,
                method,
            );
        }

        for (const key of getKeys(store)) {
            if (
                typeof store[key] !== "function"
            ) {
                continue;
            }

            const lower =
                key.toLowerCase();

            if (
                lower.includes("activ") ||
                lower.includes("presen") ||
                lower.includes("rpc") ||
                lower.includes("rich")
            ) {
                patchMethod(
                    storeName,
                    store,
                    key,
                );
            }
        }
    } catch (e) {
        error(
            `${storeName} inspection failed: ${String(e)}`,
        );
    }
}

function inspectModuleByProps(
    name: string,
    props: string[],
): void {
    try {
        const module =
            findByProps(...props);

        if (!module) {
            log(
                `${name} not found (${props.join(", ")})`,
            );

            return;
        }

        logModule(
            `${name} [${props.join(", ")}]`,
            module,
        );

        for (const method of getKeys(module)) {
            if (
                typeof module[method] !== "function"
            ) {
                continue;
            }

            const lower =
                method.toLowerCase();

            if (
                lower.includes("activ") ||
                lower.includes("presen") ||
                lower.includes("rpc") ||
                lower.includes("rich") ||
                lower.includes("application")
            ) {
                patchMethod(
                    name,
                    module,
                    method,
                );
            }
        }
    } catch (e) {
        error(
            `${name} inspection failed: ${String(e)}`,
        );
    }
}

function inspectKnownStores(): void {
    const stores = [
        "PresenceStore",
        "ActivityStore",
        "UserStore",
        "GuildMemberStore",
        "ApplicationStore",
        "ApplicationStateStore",
        "UserProfileStore",
    ];

    for (const store of stores) {
        inspectStore(store);
    }
}

function inspectKnownModules(): void {
    const candidates: Array<
        [string, string[]]
    > = [
        [
            "ActivityModule",
            ["getActivities"],
        ],
        [
            "ActivityModule",
            ["getActivity"],
        ],
        [
            "PresenceModule",
            ["getPresence"],
        ],
        [
            "PresenceModule",
            ["getPresenceForUser"],
        ],
        [
            "PresenceModule",
            ["getUserPresence"],
        ],
        [
            "RichPresenceModule",
            ["getRichPresence"],
        ],
        [
            "RichPresenceModule",
            ["getActivities", "getActivity"],
        ],
        [
            "UserActivityModule",
            ["getUserActivities"],
        ],
        [
            "ApplicationActivityModule",
            ["getActivitiesForUser"],
        ],
    ];

    for (
        const [name, props] of candidates
    ) {
        inspectModuleByProps(
            name,
            props,
        );
    }
}

function inspectReact(): void {
    try {
        log(
            `React available: ${typeof React}`,
        );

        log(
            `ReactNative available: ${typeof ReactNative}`,
        );

        if (React) {
            log(
                `React keys: ${Object.keys(React).join(", ")}`,
            );
        }

        if (ReactNative) {
            log(
                `ReactNative keys: ${Object.keys(ReactNative).slice(0, 100).join(", ")}`,
            );
        }
    } catch (e) {
        error(
            `React inspection failed: ${String(e)}`,
        );
    }
}

export class DiscordBetterRichPresenceBar {
    private started = false;

    public start(): void {
        if (this.started) {
            return;
        }

        this.started = true;

        log("Plugin loaded");

        try {
            inspectReact();
            inspectKnownStores();
            inspectKnownModules();

            log(
                `Debugger installed: ${patches.length} patches`,
            );
        } catch (e) {
            error(
                `Debugger failed: ${String(e)}`,
            );
        }
    }

    public stop(): void {
        if (!this.started) {
            return;
        }

        this.started = false;

        log(
            `Removing ${patches.length} patches`,
        );

        for (
            const unpatch of patches.splice(0)
        ) {
            try {
                unpatch();
            } catch (e) {
                error(
                    `Failed to unpatch: ${String(e)}`,
                );
            }
        }

        loggedCalls.clear();

        log("Debugger stopped");
    }
}

export default new DiscordBetterRichPresenceBar();
