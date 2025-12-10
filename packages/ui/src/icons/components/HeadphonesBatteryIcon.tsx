import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HeadphonesBatteryIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"headphones_battery"} ref={ref}/>
});

HeadphonesBatteryIcon.displayName = "HeadphonesBatteryIcon";
