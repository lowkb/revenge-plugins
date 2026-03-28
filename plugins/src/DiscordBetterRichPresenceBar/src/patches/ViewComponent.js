import { before } from "@vendetta/patcher";
import { General } from "@vendetta/ui/components";

export default () => before("render", General.View, (args) => {
    const [props] = args;
    if (!props || !props.children) return;

    // sprawdzamy, czy children mają expected elementy
    const userChild = props.children[1];
    const presenceChild = props.children[3];

    const userProps = userChild?.props;
    const presenceProps = presenceChild?.props;

    if (userProps?.user) {
        console.log("User ID:", userProps.user.id);
        console.log("Presence props:", presenceProps);
    }
});
