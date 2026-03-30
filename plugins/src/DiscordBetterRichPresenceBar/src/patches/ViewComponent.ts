import { after } from "@vendetta/patcher";
import { findByName } from "@vendetta/metro";
import { logger } from "@vendetta";

export default () => {
    logger.info("[DiscordBetterRichPresenceBar] ViewComponent patch init");

    const UserProfileCard = findByName("UserProfileCard");

    if (!UserProfileCard) {
        logger.error("[DiscordBetterRichPresenceBar] UserProfileCard not found");
        return;
    }

    logger.info("[DiscordBetterRichPresenceBar] UserProfileCard found");

    return after(UserProfileCard, (args, res) => {
        try {
            logger.info("[DiscordBetterRichPresenceBar] component called");

            const props = args?.[0];
            const wrapper = res;

            const userId = props?.user?.id;

            logger.info("[DiscordBetterRichPresenceBar] userId:", userId);

            const userProps = wrapper?.children?.[1]?.props;
            const presenceProps = wrapper?.children?.[3]?.props;

            logger.info("[DiscordBetterRichPresenceBar] presence:", presenceProps);
        } catch (err) {
            logger.error("[DiscordBetterRichPresenceBar] patch error", err);
        }
    });
};
