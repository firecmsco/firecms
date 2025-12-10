import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SwapCallsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"swap_calls"} ref={ref}/>
});

SwapCallsIcon.displayName = "SwapCallsIcon";
