import { FluxDispatcher, findByName, findByProps, before, logger } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import Settings from "./Settings.tsx";

const RowManager = findByName("RowManager");
const { isBlocked, isIgnored } = findByProps("isBlocked", "isIgnored");
let patches: Function[] = [];

const userFiltered = (id: string) =>
    id && ((storage.blocked && isBlocked(id)) || (storage.ignored && isIgnored(id)));

const msgFiltered = (msg: any) =>
    msg && (userFiltered(msg.author?.id) || (storage.removeReplies && userFiltered(msg.referenced_message?.author?.id)));

const makeMessage = (content: string | any, channelId = "0") =>
    typeof content === "string"
        ? { id: "", type: 0, content, channel_id: channelId }
        : { id: "", type: 0, content: "", channel_id: channelId, ...content };

const initPlugin = () => {
    try {
        patches.push(before("dispatch", FluxDispatcher, ([evt]: any) => {
            if (evt.type === "LOAD_MESSAGES_SUCCESS") evt.messages = evt.messages.filter((m: any) => !msgFiltered(m));
            if (["MESSAGE_CREATE", "MESSAGE_UPDATE"].includes(evt.type) && msgFiltered(evt.message)) evt.channelId = "0";
        }));

        patches.push(before("generate", RowManager.prototype, ([d]: any) => {
            if (!msgFiltered(d.message)) return;
            d.renderContentOnly = true;
            d.message.content = null;
            d.message.reactions = [];
            d.message.canShowComponents = false;
            if (d.rowType === 2) {
                d.text = "[Filtered message. Check plugin settings.]";
                d.content = [];
                d.revealed = false;
                d.roleStyle = "";
            }
        }));

        logger.log("Plugin loaded.");
    } catch (e) {
        logger.error("Plugin error:", e);
    }
};

export default {
    settings: Settings,

    onLoad() {
        storage.blocked ??= true;
        storage.ignored ??= true;
        storage.removeReplies ??= true;

        for (let type of ["MESSAGE_CREATE", "MESSAGE_UPDATE", "LOAD_MESSAGES_SUCCESS"]) {
            FluxDispatcher.dispatch({ type, message: makeMessage("INIT") });
        }

        initPlugin();
    },

    onUnload() {
        patches.forEach(u => u());
        patches = [];
        logger.log("Plugin unloaded.");
    }
};
