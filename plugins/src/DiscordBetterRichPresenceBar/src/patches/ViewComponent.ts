import { after } from "@vendetta/patcher";
import { findByName } from "@vendetta/metro";
import { logger } from "@vendetta";

export default () => {
    logger.info("[DiscordBetterRichPresenceBar] init");

    const UserProfileCard = findByName("UserProfileCard");

    if (!UserProfileCard) {
        logger.error("[DiscordBetterRichPresenceBar] not found");
        return;
    }

    return after(UserProfileCard, (args, res) => {
        logger.info("[DiscordBetterRichPresenceBar] called");
    });
};
