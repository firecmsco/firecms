import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FastForwardIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"fast_forward"} ref={ref}/>
});

FastForwardIcon.displayName = "FastForwardIcon";
