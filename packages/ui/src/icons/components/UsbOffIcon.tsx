import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const UsbOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"usb_off"} ref={ref}/>
});

UsbOffIcon.displayName = "UsbOffIcon";
