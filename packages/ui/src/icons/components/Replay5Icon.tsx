import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Replay5Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"replay_5"} ref={ref}/>
});

Replay5Icon.displayName = "Replay5Icon";
