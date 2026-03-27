import { FluxDispatcher } from "@vendetta/metro/common";
import { before } from "@vendetta/patcher";
import { findByProps, findByName } from "@vendetta/metro";
import { logger } from "@vendetta";
import { storage } from "@vendetta/plugin";
import Settings from "./settings";

const { isBlocked, isIgnored } = findByProps("isBlocked", "isIgnored");
const RowManager = findByName("RowManager");

const pluginName = "HideBlockedAndIgnoredMessages";
let patches: (() => void)[] = [];

const shouldHide = (msg: any) => {
    if (!msg?.author?.id) return false;
    if (!storage.enabled) return false;

    const id = msg.author.id;
    return isBlocked(id) || isIgnored(id);
};

const startPlugin = () => {
    try {
        // 🔥 usuwa wiadomości zanim trafią do UI
        const patch1 = before("dispatch", FluxDispatcher, ([event]) => {
            if (event.type === "LOAD_MESSAGES_SUCCESS" && event.messages) {
                event.messages = event.messages.filter(
                    (msg: any) => !shouldHide(msg)
                );
            }

            if (
                (event.type === "MESSAGE_CREATE" || event.type === "MESSAGE_UPDATE") &&
                event.message
            ) {
                if (shouldHide(event.message)) {
                    event.message = null;
                }
            }
        });

        // 🔥 usuwa placeholder "1 zablokowana wiadomość"
        const patch2 = before("generate", RowManager.prototype, ([data]) => {
            if (!storage.enabled) return;

            if (data.rowType === 2) {
                data.render = () => null;
                return;
            }

            if (shouldHide(data.message)) {
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
        startPlugin();
    },

    onUnload: () => {
        for (const unpatch of patches) unpatch();
        patches = [];
        logger.log(`${pluginName} unloaded.`);
    },

    settings: Settings,
};
