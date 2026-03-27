import { FluxDispatcher } from "@vendetta/metro/common";
import { before } from "@vendetta/patcher";
import { findByProps, findByName } from "@vendetta/metro";
import { logger, storage } from "@vendetta";
import Settings from "./settings";

const RowManager = findByName("RowManager");
const { isBlocked, isIgnored } = findByProps("isBlocked", "isIgnored");
const pluginName = "DiscordHideBlockUsers";

let blockedCache = new Set();
let ignoredCache = new Set();

const updateCache = () => {
    blockedCache.clear();
    ignoredCache.clear();
};

const isFilteredUser = (id: string) => {
    if (!id || !storage.silentFilter) return false;
    if (blockedCache.has(id) || (storage.silentFilter && isBlocked(id))) return true;
    if (ignoredCache.has(id) || (storage.silentFilter && isIgnored(id))) return true;
    return false;
};

const filterMessage = (msg: any) => {
    if (!msg || !storage.silentFilter) return false;
    if (isFilteredUser(msg.author?.id)) return true;
    if (msg.referenced_message && isFilteredUser(msg.referenced_message.author?.id)) return true;
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
            if (event.type === "MESSAGE_CREATE" || event.type === "MESSAGE_UPDATE") {
                if (filterMessage(event.message)) event.channelId = "0";
            }
        })
    );
    patches.push(
        before("generate", RowManager.prototype, ([data]) => {
            if (filterMessage(data.message)) {
                data.renderContentOnly = true;
                data.message.content = null;
                data.message.reactions = [];
                data.message.canShowComponents = false;
                if (data.rowType === 2) data.content = [];
            }
        })
    );
    logger.log(`${pluginName} loaded.`);
};

export default {
    onLoad: () => {
        storage.silentFilter ??= true;
        startPlugin();
    },
    onUnload: () => {
        for (const unpatch of patches) unpatch();
        patches = [];
        logger.log(`${pluginName} unloaded.`);
    },
    settings: Settings,
};
