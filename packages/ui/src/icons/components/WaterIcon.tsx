import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WaterIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"water"} ref={ref}/>
});

WaterIcon.displayName = "WaterIcon";
