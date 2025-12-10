import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SwapHorizontalCircleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"swap_horizontal_circle"} ref={ref}/>
});

SwapHorizontalCircleIcon.displayName = "SwapHorizontalCircleIcon";
