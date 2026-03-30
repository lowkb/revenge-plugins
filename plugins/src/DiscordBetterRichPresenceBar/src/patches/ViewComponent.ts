import { before } from "@vendetta/patcher";
import { findByName } from "@vendetta/metro";
import { logger } from "@vendetta";


export default () => {
    const UserProfile = findByName("UserProfileStore");
    
    if (!UserProfile) return;
    logger.log(UserProfile.UserStore.getCurrentUser())
    return before("render", UserProfile, (args) => {
    });
};
