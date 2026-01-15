import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SensorsOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sensors_off"} ref={ref}/>
});

SensorsOffIcon.displayName = "SensorsOffIcon";
