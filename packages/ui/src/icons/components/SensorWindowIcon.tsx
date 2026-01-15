import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SensorWindowIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sensor_window"} ref={ref}/>
});

SensorWindowIcon.displayName = "SensorWindowIcon";
