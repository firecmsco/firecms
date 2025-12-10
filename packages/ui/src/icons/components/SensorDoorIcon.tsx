import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SensorDoorIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sensor_door"} ref={ref}/>
});

SensorDoorIcon.displayName = "SensorDoorIcon";
