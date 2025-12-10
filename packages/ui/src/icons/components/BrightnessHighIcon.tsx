import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BrightnessHighIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"brightness_high"} ref={ref}/>
});

BrightnessHighIcon.displayName = "BrightnessHighIcon";
