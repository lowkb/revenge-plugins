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

// 🔥 Twoja logika (lekko poprawiona)
const isFilteredUser = (id: string) => {
    if (!id) return false;
    if (storage.blocked && isBlocked(id)) return true;
    if (storage.ignored && isIgnored(id)) return true;
    return false;
};

const filterReplies = (msg: any) => {
    if (!msg) return false;

    if (isFilteredUser(msg.author?.id)) return true;

    if (storage.removeReplies && msg.referenced_message) {
        if (isFilteredUser(msg.referenced_message.author?.id)) return true;
    }

    return false;
};

const startPlugin = () => {
    try {
        // 🔥 DATA LAYER (zamiast channelId hacka)
        const patch1 = before("dispatch", FluxDispatcher, ([event]) => {
            if (!storage.enabled) return;

            if (event.type === "LOAD_MESSAGES_SUCCESS" && event.messages) {
                event.messages = event.messages.filter(
                    (msg: any) => !filterReplies(msg)
                );
            }

            if (
                (event.type === "MESSAGE_CREATE" || event.type === "MESSAGE_UPDATE") &&
                event.message
            ) {
                if (filterReplies(event.message)) {
                    event.message = null;
                }
            }
        });

        // 🔥 KILL PLACEHOLDER
        const patch2 = before("generate", RowManager.prototype, ([data]) => {
            if (!storage.enabled) return;

            // usuwa "1 zablokowana wiadomość"
            if (data.rowType === 2) {
                data.render = () => null;
                return;
            }

            // fallback
            if (filterReplies(data.message)) {
                data.render = () => null;
            }
        });

        patches.push(patch1, patch2);

        logger.log(`${pluginName} loaded.`);
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

        startPlugin();
    },

    onUnload: () => {
        for (const unpatch of patches) unpatch();
        patches = [];
        logger.log(`${pluginName} unloaded.`);
    },

    settings: Settings,
};
