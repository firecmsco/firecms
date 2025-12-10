import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HourglassEmptyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hourglass_empty"} ref={ref}/>
});

HourglassEmptyIcon.displayName = "HourglassEmptyIcon";
