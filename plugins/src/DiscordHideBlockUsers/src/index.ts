import { FluxDispatcher } from "@vendetta/metro/common";
import { before } from "@vendetta/patcher";
import { findByProps } from "@vendetta/metro";
import { logger } from "@vendetta";
import { storage } from "@vendetta/plugin";
import Settings from "./settings";

const { isBlocked, isIgnored } = findByProps("isBlocked", "isIgnored");

const pluginName = "HideBlockedAndIgnoredMessages";
let patches: (() => void)[] = [];

// Sprawdza, czy wiadomość powinna być ukryta
const filterMessage = (msg: any) => {
    if (!msg?.author?.id) return false;
    if (!storage.hideUsers) return false; // ustawienie OFF → pokazuj wszystkie
    const id = msg.author.id;
    return (storage.blocked && isBlocked(id)) || (storage.ignored && isIgnored(id));
};

const startPlugin = () => {
    try {
        const patch = before("dispatch", FluxDispatcher, ([event]) => {
            if (event.type === "LOAD_MESSAGES_SUCCESS") {
                event.messages = event.messages.filter(msg => !filterMessage(msg));
            }
            if (event.type === "MESSAGE_CREATE" || event.type === "MESSAGE_UPDATE") {
                if (filterMessage(event.message)) event.channelId = "0";
            }
        });
        patches.push(patch);

        logger.log(`${pluginName} loaded.`);
    } catch (err) {
        logger.error(`[${pluginName} Error]`, err);
    }
};

export default {
    onLoad: () => {
        storage.blocked ??= true;
        storage.ignored ??= true;
        storage.hideUsers ??= true;

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
