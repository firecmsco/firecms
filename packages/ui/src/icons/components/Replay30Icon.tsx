import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Replay30Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"replay_30"} ref={ref}/>
});

Replay30Icon.displayName = "Replay30Icon";
