import { before } from "@vendetta/patcher";
import { findByName } from "@vendetta/metro";
import { logger } from "@vendetta";

export default () => {
    const UserProfileCard = findByName("UserProfileCard");
    if (!UserProfileCard) return;

    return before("render", UserProfileCard, (args, res) => {
        const rpcWrapper = res?.props?.children?.[1];
        if (!rpcWrapper) return res;

        const children = rpcWrapper.props?.children;

        if (Array.isArray(children)) {
            logger.log("RPC children count:", children.length);

            children.forEach((child, i) => {
                logger.log(`Child[${i}] type:`, child?.type?.name ?? child?.type);
                logger.log(`Child[${i}] props keys:`, Object.keys(child?.props ?? {}));
            });
        } else {
            logger.log("RPC single child type:", children?.type?.name ?? children?.type);
            logger.log("RPC single child props keys:", Object.keys(children?.props ?? {}));
        }

        return res;
    });
};
