import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SwapVerticalCircleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"swap_vertical_circle"} ref={ref}/>
});

SwapVerticalCircleIcon.displayName = "SwapVerticalCircleIcon";
