import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BrightnessAutoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"brightness_auto"} ref={ref}/>
});

BrightnessAutoIcon.displayName = "BrightnessAutoIcon";
