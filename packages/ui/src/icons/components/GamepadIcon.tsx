import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GamepadIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"gamepad"} ref={ref}/>
});

GamepadIcon.displayName = "GamepadIcon";
