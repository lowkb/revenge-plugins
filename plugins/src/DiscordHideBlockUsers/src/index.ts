import { FluxDispatcher } from "@vendetta/metro/common";
import { before } from "@vendetta/patcher";
import { findByProps, findByName } from "@vendetta/metro";
import { logger } from "@vendetta";
import { storage } from "@vendetta/plugin";
import Settings from "./settings";

const RowManager = findByName("RowManager");
const { isBlocked, isIgnored } = findByProps("isBlocked", "isIgnored");

const pluginName = "HideBlockedAndIgnoredMessages";
let patches: (() => void)[] = [];

const log = (...args: any[]) => logger.log(`[${pluginName}]`, ...args);
const debug = (...args: any[]) => {
    if (storage.debug) logger.log(`[${pluginName}][DEBUG]`, ...args);
};

// 🔍 USER CHECK
const isFilteredUser = (id: string) => {
    if (!id) return false;

    const blocked = storage.blocked && isBlocked(id);
    const ignored = storage.ignored && isIgnored(id);

    if (blocked || ignored) {
        debug("User filtered", { id, blocked, ignored });
        return true;
    }

    return false;
};

// 🔍 MESSAGE CHECK
const filterReplies = (msg: any) => {
    if (!msg) return false;

    const authorId = msg.author?.id;

    if (isFilteredUser(authorId)) {
        debug("Message filtered (author)", {
            messageId: msg.id,
            authorId
        });
        return true;
    }

    if (storage.removeReplies && msg.referenced_message) {
        const refId = msg.referenced_message.author?.id;

        if (isFilteredUser(refId)) {
            debug("Message filtered (reply)", {
                messageId: msg.id,
                replyTo: refId
            });
            return true;
        }
    }

    return false;
};

const startPlugin = () => {
    try {
        log("Starting plugin...");

        // 🔥 DISPATCH LAYER
        const patch1 = before("dispatch", FluxDispatcher, ([event]) => {
            if (!storage.enabled) return;

            debug("Event received:", event.type);

            if (event.type === "LOAD_MESSAGES_SUCCESS" && event.messages) {
                const beforeCount = event.messages.length;

                event.messages = event.messages.filter(
                    (msg: any) => !filterReplies(msg)
                );

                const afterCount = event.messages.length;

                debug("LOAD_MESSAGES_SUCCESS filtered", {
                    before: beforeCount,
                    after: afterCount,
                    removed: beforeCount - afterCount
                });
            }

            if (
                (event.type === "MESSAGE_CREATE" || event.type === "MESSAGE_UPDATE") &&
                event.message
            ) {
                const shouldRemove = filterReplies(event.message);

                debug(`${event.type}`, {
                    messageId: event.message?.id,
                    shouldRemove
                });

                if (shouldRemove) {
                    debug("Dropping message", event.message.id);
                    event.message = null;
                }
            }
        });

        // 🔥 UI LAYER
        const patch2 = before("generate", RowManager.prototype, ([data]) => {
            if (!storage.enabled) return;

            if (data.rowType === 2) {
                debug("Removing placeholder row");
                data.render = () => null;
                return;
            }

            if (filterReplies(data.message)) {
                debug("Blocking render of message row", data.message?.id);
                data.render = () => null;
            }
        });

        patches.push(patch1, patch2);

        log("Plugin loaded.");
    } catch (err) {
        logger.error(`[${pluginName}]`, err);
    }
};

export default {
    onLoad: () => {
        storage.enabled ??= true;
        storage.blocked ??= true;
        storage.ignored ??= true;
        storage.removeReplies ??= true;
        storage.debug ??= false;

        log("Loading plugin...");
        debug("Debug mode enabled");

        startPlugin();
    },

    onUnload: () => {
        log("Unloading plugin...");
        for (const unpatch of patches) unpatch();
        patches = [];
        log("Plugin unloaded.");
    },

    settings: Settings,
};
