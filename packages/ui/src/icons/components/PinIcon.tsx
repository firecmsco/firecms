import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PinIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"pin"} ref={ref}/>
});

PinIcon.displayName = "PinIcon";
