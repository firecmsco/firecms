import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WaterDropIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"water_drop"} ref={ref}/>
});

WaterDropIcon.displayName = "WaterDropIcon";
