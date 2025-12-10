import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TireRepairIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"tire_repair"} ref={ref}/>
});

TireRepairIcon.displayName = "TireRepairIcon";
