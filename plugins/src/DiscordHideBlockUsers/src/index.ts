import { FluxDispatcher } from "@vendetta/metro/common";
import { before } from "@vendetta/patcher";
import { findByProps, findByName } from "@vendetta/metro";
import { logger } from "@vendetta";
import { storage } from "@vendetta/plugin";
import Settings from "./Settings";

const RowManager = findByName("RowManager");
const { isBlocked, isIgnored } = findByProps("isBlocked", "isIgnored");

const pluginName = "HideBlockedAndIgnoredMessages";

// Check if a user should be filtered
const isFilteredUser = (id?: string) => {
    if (!id) return false;
    if (storage.blocked && isBlocked(id)) return true;
    if (storage.ignored && isIgnored(id)) return true;
    return false;
};

// Check if a message or its reply should be filtered
const filterMessage = (msg: any) => {
    if (!msg) return false;
    // Filter message if author is blocked/ignored
    if (isFilteredUser(msg.author?.id)) return true;
    // Always filter replies to blocked/ignored users
    if (msg.referenced_message) {
        if (isFilteredUser(msg.referenced_message.author?.id)) return true;
    }
    return false;
};

let patches: any[] = [];

const startPlugin = () => {
    try {
        // Patch dispatcher to remove blocked/ignored messages
        const patch1 = before("dispatch", FluxDispatcher, ([event]: any) => {
            if (event.type === "LOAD_MESSAGES_SUCCESS" && Array.isArray(event.messages)) {
                event.messages = event.messages.filter((msg: any) => !filterMessage(msg));
            }

            if (event.type === "MESSAGE_CREATE" || event.type === "MESSAGE_UPDATE") {
                if (filterMessage(event.message)) {
                    event.cancel = true;
                }
            }
        });
        patches.push(patch1);

        // Patch RowManager to prevent rendering filtered messages
        const patch2 = before("generate", RowManager.prototype, ([data]: any) => {
            if (filterMessage(data.message)) {
                data.cancel = true;
            }
        });
        patches.push(patch2);

        logger.log(`${pluginName} loaded.`);
    } catch (err) {
        logger.error(`[${pluginName} Error]`, err);
    }
};

export default {
    onLoad: () => {
        logger.log(`Loading ${pluginName}...`);

        storage.blocked ??= true;
        storage.ignored ??= true;

        startPlugin();
    },

    onUnload: () => {
        logger.log(`Unloading ${pluginName}...`);
        for (const unpatch of patches) unpatch();
        patches = [];
        logger.log(`${pluginName} unloaded.`);
    },

    settings: Settings,
};
