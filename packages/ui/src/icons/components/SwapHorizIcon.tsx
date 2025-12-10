import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SwapHorizIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"swap_horiz"} ref={ref}/>
});

SwapHorizIcon.displayName = "SwapHorizIcon";
