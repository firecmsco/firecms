import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Replay10Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"replay_10"} ref={ref}/>
});

Replay10Icon.displayName = "Replay10Icon";
