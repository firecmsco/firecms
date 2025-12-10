import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PinInvokeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"pin_invoke"} ref={ref}/>
});

PinInvokeIcon.displayName = "PinInvokeIcon";
