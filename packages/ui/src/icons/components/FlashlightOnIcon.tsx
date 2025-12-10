import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FlashlightOnIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"flashlight_on"} ref={ref}/>
});

FlashlightOnIcon.displayName = "FlashlightOnIcon";
