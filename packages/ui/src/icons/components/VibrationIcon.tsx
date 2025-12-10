import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VibrationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"vibration"} ref={ref}/>
});

VibrationIcon.displayName = "VibrationIcon";
