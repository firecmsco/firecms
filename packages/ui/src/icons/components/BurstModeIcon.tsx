import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BurstModeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"burst_mode"} ref={ref}/>
});

BurstModeIcon.displayName = "BurstModeIcon";
