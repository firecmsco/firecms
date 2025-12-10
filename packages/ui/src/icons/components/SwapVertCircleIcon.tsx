import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SwapVertCircleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"swap_vert_circle"} ref={ref}/>
});

SwapVertCircleIcon.displayName = "SwapVertCircleIcon";
