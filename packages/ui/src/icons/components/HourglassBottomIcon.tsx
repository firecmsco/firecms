import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HourglassBottomIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hourglass_bottom"} ref={ref}/>
});

HourglassBottomIcon.displayName = "HourglassBottomIcon";
