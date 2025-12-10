import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PinchIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"pinch"} ref={ref}/>
});

PinchIcon.displayName = "PinchIcon";
