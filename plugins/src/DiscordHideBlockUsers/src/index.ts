
import { FluxDispatcher, findByName, findByProps, before, logger } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import Settings from "./Settings";

const { isBlocked } = findByProps("isBlocked");
const RowManager = findByName("RowManager");
let patches: Function[] = [];

const filterMsg = (msg: any) => storage.hideBlocked && msg && isBlocked(msg.author?.id);

export default {
    settings: Settings,

    onLoad() {
        storage.hideBlocked ??= true;

        patches.push(
            before("dispatch", FluxDispatcher, ([e]: any) => {
                if (e.type === "LOAD_MESSAGES_SUCCESS") e.messages = e.messages.filter((m: any) => !filterMsg(m));
                if (["MESSAGE_CREATE", "MESSAGE_UPDATE"].includes(e.type) && filterMsg(e.message)) e.channelId = "0";
            })
        );

        patches.push(
            before("generate", RowManager.prototype, ([d]: any) => {
                if (!filterMsg(d.message)) return;
                d.renderContentOnly = true;
                d.message.content = null;
                d.message.reactions = [];
                d.message.canShowComponents = false;
                if (d.rowType === 2) {
                    d.text = "[Blocked message hidden]";
                    d.content = [];
                    d.revealed = false;
                    d.roleStyle = "";
                }
            })
        );

        for (let type of ["MESSAGE_CREATE", "MESSAGE_UPDATE", "LOAD_MESSAGES_SUCCESS"]) {
            FluxDispatcher.dispatch({ type, message: { id: "0", type: 0, content: "INIT" } });
        }

        logger.log("HideBlockedMessages loaded.");
    },

    onUnload() {
        patches.forEach((u) => u());
        patches = [];
        logger.log("HideBlockedMessages unloaded.");
    },
};
