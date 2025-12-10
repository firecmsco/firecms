import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CarRepairIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"car_repair"} ref={ref}/>
});

CarRepairIcon.displayName = "CarRepairIcon";
