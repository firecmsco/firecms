import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ModeFanOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"mode_fan_off"} ref={ref}/>
});

ModeFanOffIcon.displayName = "ModeFanOffIcon";
