import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HourglassTopIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hourglass_top"} ref={ref}/>
});

HourglassTopIcon.displayName = "HourglassTopIcon";
