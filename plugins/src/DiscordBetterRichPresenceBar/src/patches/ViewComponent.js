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

    if (!userProps?.user) return; // ignorujemy wrappery bez użytkownika

    const userId = userProps.user.id;
    const username = userProps.user.username;

    const status = presenceProps?.status;
    const activities = presenceProps?.activities?.map(a => a.name);

    logger.log(`[User ${username} | ID: ${userId}]`);
    if (status) logger.log("Presence status:", status);
    if (activities?.length) logger.log("Presence activities:", activities);
});
