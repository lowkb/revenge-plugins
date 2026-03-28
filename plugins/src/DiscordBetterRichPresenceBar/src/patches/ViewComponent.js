import { before } from "@vendetta/patcher";
import { storage } from "@vendetta/plugin";
import { General } from "@vendetta/ui/components";

export default () => before("render", General.View, (args) => {
    

    const [wrapper] = args;
    if (!wrapper || !Array.isArray(wrapper.style)) return;

            // we check if this wrapper is memberlist
            const userProps   = wrapper.children?.[1]?.props;
                const presenceProps = wrapper.children?.[3]?.props;

    
                console.log(userProps.user?.id, presenceProps)

        
    }

});
