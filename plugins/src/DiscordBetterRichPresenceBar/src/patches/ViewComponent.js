import { before } from "@vendetta/patcher";
import { logger } from "@vendetta";
import { General } from "@vendetta/ui/components";

export default () => before("render", General.View, (args) => {
    const [props] = args;
    if (!props || !props.children) return;

    const userChild = props.children[1];
    const presenceChild = props.children[3];

    const userProps = userChild?.props;
    const presenceProps = presenceChild?.props;

    // logujemy tylko serializowalne dane
    if (userProps?.user) {
        logger.log("User ID:", userProps.user.id);
        logger.log("Username:", userProps.user.username);
    }

    if (presenceProps) {
        // przykładowo logujemy tylko pola które są proste
        logger.log("Presence status:", presenceProps.status);
        logger.log("Presence activities:", presenceProps.activities?.map(a => a.name));
    }
});
