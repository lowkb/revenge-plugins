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

    if (userProps?.user) {
        logger.log("User ID:", userProps.user.id);
        logger.log("Username:", userProps.user.username);
    }

    // bezpieczny fallback dla statusu i aktywności
    const status = presenceProps?.status ?? "no status";
    const activities = presenceProps?.activities?.map(a => a.name) ?? [];

    logger.log("Presence status:", status);
    logger.log("Presence activities:", activities.length ? activities : ["no activities"]);
});
