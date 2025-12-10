import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VolcanoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"volcano"} ref={ref}/>
});

VolcanoIcon.displayName = "VolcanoIcon";
