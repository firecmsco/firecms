import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HourglassDisabledIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hourglass_disabled"} ref={ref}/>
});

HourglassDisabledIcon.displayName = "HourglassDisabledIcon";
