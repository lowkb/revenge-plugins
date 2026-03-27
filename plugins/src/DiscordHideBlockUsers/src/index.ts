import { FluxDispatcher } from "@vendetta/metro/common";
import { before } from "@vendetta/patcher";
import { findByName, findByProps } from "@vendetta/metro";
import { logger } from "@vendetta";
import { storage } from "@vendetta/plugin";
import Settings from "./settings";

const RowManager = findByName("RowManager");
const { isBlocked, isIgnored } = findByProps("isBlocked", "isIgnored");

const pluginName = "HideBlockedAndIgnoredMessages";

const constructMessage = (message: string | any, channel: any) => {
    let msg = {
        id: "",
        type: 0,
        content: "",
        channel_id: channel.id,
        author: { id: "", username: "", avatar: "", discriminator: "", publicFlags: 0, avatarDecoration: null },
        attachments: [], embeds: [], mentions: [], mention_roles: [],
        pinned: false, mention_everyone: false, tts: false,
        timestamp: "", edited_timestamp: null, flags: 0, components: []
    };
    return typeof message === "string" ? { ...msg, content: message } : { ...msg, ...message };
};

// Sprawdza, czy wiadomość powinna być ukryta
const filterMessage = (msg: any) => {
    if (!msg || !storage.hideBlocked) return false;
    const authorId = msg.author?.id;
    if (!authorId) return false;
    if (isBlocked(authorId) || isIgnored(authorId)) return true;
    if (msg.referenced_message?.author?.id) {
        if (isBlocked(msg.referenced_message.author.id) || isIgnored(msg.referenced_message.author.id)) return true;
    }
    return false;
};

let patches: (() => void)[] = [];

const startPlugin = () => {
    try {
        const patchDispatcher = before("dispatch", FluxDispatcher, ([event]) => {
            if (event.type === "LOAD_MESSAGES_SUCCESS") {
                event.messages = event.messages.filter((m: any) => !filterMessage(m));
            }
            if (event.type === "MESSAGE_CREATE" || event.type === "MESSAGE_UPDATE") {
                if (filterMessage(event.message)) event.channelId = "0";
            }
        });

        const patchRender = before("generate", RowManager.prototype, ([data]) => {
            if (filterMessage(data.message)) {
                data.renderContentOnly = true;
                data.message.content = null;
                data.message.reactions = [];
                data.message.canShowComponents = false;
                if (data.rowType === 2) {
                    data.roleStyle = "";
                    data.text = "[Filtered message]";
                    data.revealed = false;
                    data.content = [];
                }
            }
        });

        patches.push(patchDispatcher, patchRender);
        logger.log(`${pluginName} loaded.`);
    } catch (err) {
        logger.error(`[${pluginName} Error]`, err);
    }
};

export default {
    onLoad: () => {
        storage.hideBlocked ??= true;
        for (let type of ["MESSAGE_CREATE", "MESSAGE_UPDATE", "LOAD_MESSAGES", "LOAD_MESSAGES_SUCCESS"]) {
            FluxDispatcher.dispatch({
                type,
                message: constructMessage("PLACEHOLDER", { id: "0" }),
                messages: [],
            });
        }
        startPlugin();
    },

    onUnload: () => {
        for (let unpatch of patches) unpatch();
        patches = [];
        logger.log(`${pluginName} unloaded.`);
    },

    settings: Settings,
};
