import { before } from "@vendetta/patcher";
import { logger } from "@vendetta";
import { General } from "@vendetta/ui/components";

export default () => before("render", General.View, (args) => {
    const [props] = args;
    if (!props || !props.children) return;

    const userChild = props.children[1];
    const presenceChild = props.children[3];

    logger.log("userChild:", userChild);
    logger.log("presenceChild:", presenceChild);

    const userProps = userChild?.props;
    const presenceProps = presenceChild?.props;

    if (userProps?.user) {
        logger.log("User ID:", userProps.user?.id);
        logger.log("Presence props:", presenceProps);
    }
});
