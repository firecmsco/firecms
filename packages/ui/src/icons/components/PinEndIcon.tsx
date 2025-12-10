import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PinEndIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"pin_end"} ref={ref}/>
});

PinEndIcon.displayName = "PinEndIcon";
