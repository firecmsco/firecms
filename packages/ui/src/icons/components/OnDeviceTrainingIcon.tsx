import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const OnDeviceTrainingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"on_device_training"} ref={ref}/>
});

OnDeviceTrainingIcon.displayName = "OnDeviceTrainingIcon";
