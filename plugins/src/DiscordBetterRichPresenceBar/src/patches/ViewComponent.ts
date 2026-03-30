import { before } from "@vendetta/patcher";
import { findByName } from "@vendetta/metro";
import { logger } from "@vendetta";


export default () => {
    const UserProfile = findByName("UserProfile");
    
    if (!UserProfile) return;
    logger.log(UserProfile.user.id)
    return before("render", UserProfile, (args) => {

        const wrapper = args[0];
        if (!wrapper || !Array.isArray(wrapper.children)) return;

        // Szukamy dziecka, które ma status / rich presence
        const userInfo = wrapper.children.find(c => c?.props?.user);
        const presence = wrapper.children.find(c => c?.props?.status);

        if (!userInfo || typeof userInfo.props.user?.id !== "string") return;
        if (!presence || typeof presence.props.status !== "string") return;

        const userId = userInfo.props.user.id;
        const status = presence.props.status;

        logger.log(userId, status);
    });
};
