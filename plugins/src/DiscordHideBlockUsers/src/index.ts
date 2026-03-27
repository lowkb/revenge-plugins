import { FluxDispatcher } from "@vendetta/metro/common";
import { before } from "@vendetta/patcher";
import { findByProps, findByName } from "@vendetta/metro";
import { logger, storage } from "@vendetta";
import Settings from "./settings";

const RowManager = findByName("RowManager");
const { isBlocked, isIgnored } = findByProps("isBlocked", "isIgnored");
const pluginName = "HideBlockedAndIgnoredMessages";

let blockedCache = new Set<string>();
let ignoredCache = new Set<string>();

const updateCache = () => {
    blockedCache.clear();
    ignoredCache.clear();
};

const isFilteredUser = (id: string) => {
    if (!id) return false;
    if (storage.blocked && (blockedCache.has(id) || isBlocked(id))) return true;
    if (storage.ignored && (ignoredCache.has(id) || isIgnored(id))) return true;
    return false;
};

const filterMessage = (msg: any) => {
    if (!msg) return false;
    if (isFilteredUser(msg.author?.id)) return true;
    if (storage.removeReplies && msg.referenced_message) {
        if (isFilteredUser(msg.referenced_message.author?.id)) return true;
    }
    return false;
};

let patches: (() => void)[] = [];

const startPlugin = () => {
    updateCache();

    patches.push(
        before("dispatch", FluxDispatcher, ([event]) => {
            if (event.type === "LOAD_MESSAGES_SUCCESS" && event.messages) {
                event.messages = event.messages.filter((msg: any) => !filterMessage(msg));
            }
            if ((event.type === "MESSAGE_CREATE" || event.type === "MESSAGE_UPDATE") && filterMessage(event.message)) {
                event.channelId = "0";
            }
        })
    );

    patches.push(
        before("generate", RowManager.prototype, ([data]) => {
            if (filterMessage(data.message)) {
                data.render = () => null;
            }
        })
    );

    logger.log(`${pluginName} loaded.`);
};

export default {
    onLoad: () => {
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
