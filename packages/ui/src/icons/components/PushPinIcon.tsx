import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PushPinIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"push_pin"} ref={ref}/>
});

PushPinIcon.displayName = "PushPinIcon";
