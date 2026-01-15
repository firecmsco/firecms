import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FlashlightOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"flashlight_off"} ref={ref}/>
});

FlashlightOffIcon.displayName = "FlashlightOffIcon";
