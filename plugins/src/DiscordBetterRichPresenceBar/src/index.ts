import { before } from "@vendetta/patcher";
import { findByName } from "@vendetta/metro";
import { logger } from "@vendetta";

export default () => {
    const UserProfile = findByName("UserProfile");
    const UserStore = bunny.metro.findByStoreName("UserStore");

    if (!UserProfile || !UserStore) return;

    return before("render", UserProfile, (args) => {
        const [props] = args;

        if (!props?.user?.id) return;

        const user = UserStore.getUser(props.user.id);
        if (!user) return;

        logger.log("User:", user);

        // 🔥 przykład modyfikacji UI
        if (props?.style) {
            props.style = Array.isArray(props.style)
                ? [...props.style, { borderWidth: 2, borderColor: "red" }]
                : [{ borderWidth: 2, borderColor: "red" }];
        }
    });
};
