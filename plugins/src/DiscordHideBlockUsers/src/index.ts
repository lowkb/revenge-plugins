import { FluxDispatcher } from "@vendetta/metro/common";
import { before } from "@vendetta/patcher";
import { findByProps, findByName } from "@vendetta/metro";
import { logger } from "@vendetta";
import { storage } from "@vendetta/plugin";
import Settings from "./settings";

const RowManager = findByName("RowManager");
const { isBlocked, isIgnored } = findByProps("isBlocked", "isIgnored");

const isFilteredUser = (id?: string) => {
    if (!id) return false;
    if (storage.blocked && isBlocked(id)) return true;
    if (storage.ignored && isIgnored(id)) return true;
    return false;
};

const filterMessage = (msg: any) => {
    if (!msg) return false;
    if (isFilteredUser(msg.author?.id)) return true;
    if (msg.referenced_message?.author?.id && isFilteredUser(msg.referenced_message.author.id)) return true;
    return false;
};

let patches: (() => void)[] = [];

const startPlugin = () => {
    try {
        const patch1 = before("dispatch", FluxDispatcher, ([event]: any) => {
            if (event.type === "LOAD_MESSAGES_SUCCESS" && Array.isArray(event.messages)) {
                event.messages.forEach((msg: any) => {
                    if (filterMessage(msg)) {
                        msg.filtered = true;
                        msg.content = null;
                        msg.reactions = [];
                        msg.canShowComponents = false;
                    }
                });
            }

            if (event.type === "MESSAGE_CREATE" || event.type === "MESSAGE_UPDATE") {
                if (filterMessage(event.message)) {
                    event.message.filtered = true;
                    event.message.content = null;
                    event.message.reactions = [];
                    event.message.canShowComponents = false;
                    logger.log(`[DiscordHideBlockUsers]: Filtered message from ${event.message.author?.username}`);
                }
            }
        });
        patches.push(patch1);

        const patch2 = before("generate", RowManager.prototype, ([data]: any) => {
            if (data.message?.filtered) {
                data.renderContentOnly = true;
                data.message.content = null;
                data.message.reactions = [];
                data.message.canShowComponents = false;
                if (data.rowType === 2) {
                    data.roleStyle = "";
                    data.revealed = false;
                    data.content = [];
                    data.text = "[Filtered message. Check plugin settings.]";
                }
                logger.log(`[DiscordHideBlockUsers]: Filtered row for message from ${data.message.author?.username}`);
            }
        });
        patches.push(patch2);

        logger.log(`[DiscordHideBlockUsers]: Plugin loaded`);
    } catch (err) {
        logger.error(`[DiscordHideBlockUsers]: Error loading plugin`, err);
    }
};

export default {
    onLoad: () => {
        logger.log(`[DiscordHideBlockUsers]: Plugin loading`);
        storage.blocked ??= true;
        storage.ignored ??= true;
        startPlugin();
    },

    onUnload: () => {
        logger.log(`[DiscordHideBlockUsers]: Plugin unloading`);
        patches.forEach(unpatch => unpatch());
        patches = [];
        logger.log(`[DiscordHideBlockUsers]: Plugin unloaded`);
    },

    settings: Settings,
};
