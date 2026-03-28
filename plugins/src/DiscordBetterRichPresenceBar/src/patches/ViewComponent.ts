import { before } from "@vendetta/patcher";
import { findByName } from "@vendetta/metro";
import { logger } from "@vendetta";

export default () => {
    const UserProfileCard = findByName("UserProfileCard");
    if (!UserProfileCard) return;

    return before("render", UserProfileCard, (args) => {
            const userProps = wrapper.children?.[1]?.props;
            const presenceProps = wrapper.children?.[3]?.props;
        
        logger.log(userProps.user?.id, presenceProps)
    });
};
