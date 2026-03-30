export default () => before("render", General.View, (args) => {
        if(!isEnabled) return;

    const [wrapper] = args;
    if (!wrapper || !Array.isArray(wrapper.style)) return;


            const userProps   = wrapper.children?.[1]?.props;
                const presenceProps = wrapper.children?.[3]?.props;

        
                if (!userProps?.hasOwnProperty("user") || typeof userProps.user?.id !== "string") return;
                if (!presenceProps?.hasOwnProperty("status") || typeof presenceProps.status !== "string") return;

                console.log(userProps.user?.id, presenceProps)

                const userPresence = presenceProps.status;

                
            }           
    }
});
