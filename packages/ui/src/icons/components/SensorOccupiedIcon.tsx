import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SensorOccupiedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sensor_occupied"} ref={ref}/>
});

SensorOccupiedIcon.displayName = "SensorOccupiedIcon";
