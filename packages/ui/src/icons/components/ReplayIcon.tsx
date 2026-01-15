import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ReplayIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"replay"} ref={ref}/>
});

ReplayIcon.displayName = "ReplayIcon";
