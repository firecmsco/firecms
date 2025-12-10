import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const UsbIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"usb"} ref={ref}/>
});

UsbIcon.displayName = "UsbIcon";
