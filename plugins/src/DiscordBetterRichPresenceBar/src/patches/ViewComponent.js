import { before } from "@vendetta/patcher";
import { General } from "@vendetta/ui/components";
import { logger } from "@vendetta";

export default () => before("render", General.View, (args) => {

    logger.log("rpcview ok");
const [props] = args;
    if (!props || !props.children) return;
    
    const userChild = props.children[1];
    const presenceChild = props.children[3];

    const userProps = userChild?.props;
    const presenceProps = presenceChild?.props;

    if (userProps?.user) {
        logger.log("User ID:", userProps.user?.id);
        logger.log("Presence props:", presenceProps);
    }
});
