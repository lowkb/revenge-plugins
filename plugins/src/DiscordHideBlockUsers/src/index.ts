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

// --- patch dispatcher i RowManager ---
const startPlugin = () => {
    try {
        // 🔹 dispatcher – filtruje wiadomości z listy i przychodzące
        const patch1 = before("dispatch", FluxDispatcher, ([event]) => {
            if (!storage.enabled) return;

            if (event.type === "LOAD_MESSAGES_SUCCESS" && event.messages) {
                const beforeCount = event.messages.length;
                event.messages = event.messages.map(msg => {
                    if (filterReplies(msg)) {
                        msg.filtered = true; // oznaczamy wiadomość jako ukrytą
                    }
                    return msg;
                });
                const filteredCount = event.messages.filter(m => m.filtered).length;
                logger.log(`[${pluginName} DEBUG] Marked messages as filtered: ${filteredCount}/${beforeCount}`);
            }

            if ((event.type === "MESSAGE_CREATE" || event.type === "MESSAGE_UPDATE") && event.message) {
                if (filterReplies(event.message)) {
                    logger.log(`[${pluginName} DEBUG] Filtering incoming message from: ${event.message.author?.username}`);
                    event.message.filtered = true;
                }
            }
        });

        // 🔹 RowManager – ukrywa treść wiadomości, ale nie zostawia przerwy
        const patch2 = before("generate", RowManager.prototype, ([data]) => {
            if (!storage.enabled || !data.message) return;

            if (data.message.filtered) {
                data.render = () => null; // nic nie renderujemy
                data.message.content = null;
                data.message.reactions = [];
                data.message.canShowComponents = false;
            }
        });

        patches.push(patch1, patch2);
        logger.log(`${pluginName} loaded.`);
    } catch (err) {
        logger.error(`[${pluginName} Error]`, err);
    }
};

export default {
    onLoad: () => {
        logger.log(`Loading ${pluginName}...`);

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
