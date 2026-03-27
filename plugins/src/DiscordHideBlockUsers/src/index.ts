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

// --- logika filtrowania wiadomości ---
const isFilteredUser = (id: string) => {
    if (!id) return false;
    return (storage.blocked && isBlocked(id)) || (storage.ignored && isIgnored(id));
};

const filterReplies = (msg: any) => {
    if (!msg) return false;
    if (isFilteredUser(msg.author?.id)) return true;
    if (storage.removeReplies && msg.referenced_message) {
        if (isFilteredUser(msg.referenced_message.author?.id)) return true;
    }
    return false;
};

// --- patch dispatcher ---
const startPlugin = () => {
    try {
        const patch1 = before("dispatch", FluxDispatcher, ([event]) => {
            if (!storage.enabled) return;

            // 🔹 debug log
            logger.log(`[${pluginName} DEBUG] Event type:`, event.type);

            if (event.type === "LOAD_MESSAGES_SUCCESS" && event.messages) {
                const beforeCount = event.messages.length;
                event.messages = event.messages.filter(msg => !filterReplies(msg));
                const afterCount = event.messages.length;
                logger.log(`[${pluginName} DEBUG] Filtered messages: ${beforeCount - afterCount}`);
            }

            if ((event.type === "MESSAGE_CREATE" || event.type === "MESSAGE_UPDATE") && event.message) {
                if (filterReplies(event.message)) {
                    logger.log(`[${pluginName} DEBUG] Dropping message from: ${event.message.author?.username}`);
                    event.message = null; // całkowicie usuń wiadomość
                }
            }
        });

        patches.push(patch1);

        logger.log(`${pluginName} loaded.`);
    } catch (err) {
        logger.error(`[${pluginName} Error]`, err);
    }
};

export default {
    onLoad: () => {
        logger.log(`Loading ${pluginName}...`);

        // ustawienia domyślne
        storage.enabled ??= true;
        storage.blocked ??= true;
        storage.ignored ??= true;
        storage.removeReplies ??= true;

        startPlugin();
        logger.log(`${pluginName} started.`);
    },

    onUnload: () => {
        for (const unpatch of patches) unpatch();
        patches = [];
        logger.log(`${pluginName} unloaded.`);
    },

    settings: Settings,
};
