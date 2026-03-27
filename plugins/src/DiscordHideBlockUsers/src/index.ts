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
                logger.log(`[Debug] LOAD_MESSAGES_SUCCESS: ${event.messages.length}`);

                event.messages.forEach((msg: any) => {
                    if (filterMessage(msg)) {
                        logger.log(`[Debug] Filtered (LOAD): ${msg.author?.username}`);
                    }
                });
            }

            if (event.type === "MESSAGE_CREATE" || event.type === "MESSAGE_UPDATE") {
                logger.log(`[Debug] ${event.type}: ${event.message?.author?.username}`);

                if (filterMessage(event.message)) {
                    logger.log(`[Debug] Filtered (LIVE): ${event.message.author?.username}`);
                }
            }
        });
        patches.push(patch1);

        const patch2 = before("generate", RowManager.prototype, ([data]: any) => {
            logger.log(`[Debug] RowType: ${data.rowType}`);

            // 🔥 usuwa "1 zablokowana wiadomość"
            if (typeof data.rowType === "string") {
                if (
                    data.rowType.includes("blocked") ||
                    data.rowType.includes("ignored") ||
                    data.rowType === "blocked_messages"
                ) {
                    data.cancel = true;
                    logger.log(`[Debug] Removed blocked container`);
                    return;
                }
            }

            if (!data.message) {
                logger.log(`[Debug] Row without message`);
                return;
            }

            const msg = data.message;

            logger.log(`[Debug] Row: ${msg.author?.username} | rowType: ${data.rowType}`);

            if (filterMessage(msg)) {
                data.cancel = true;
                logger.log(`[Debug] Row removed: ${msg.author?.username}`);
            }
        });
        patches.push(patch2);

        logger.log(`[DiscordHideBlockUsers]: Plugin loaded`);
    } catch (err) {
        logger.error(`[DiscordHideBlockUsers]: Error`, err);
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
