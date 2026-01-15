import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RadarIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"radar"} ref={ref}/>
});

RadarIcon.displayName = "RadarIcon";
