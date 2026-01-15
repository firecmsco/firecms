import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PinDropIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"pin_drop"} ref={ref}/>
});

PinDropIcon.displayName = "PinDropIcon";
