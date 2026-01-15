import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HourglassFullIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hourglass_full"} ref={ref}/>
});

HourglassFullIcon.displayName = "HourglassFullIcon";
