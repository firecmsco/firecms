import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HardwareIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hardware"} ref={ref}/>
});

HardwareIcon.displayName = "HardwareIcon";
