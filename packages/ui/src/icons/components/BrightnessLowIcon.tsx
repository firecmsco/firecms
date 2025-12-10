import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BrightnessLowIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"brightness_low"} ref={ref}/>
});

BrightnessLowIcon.displayName = "BrightnessLowIcon";
