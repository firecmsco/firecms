import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const KeyboardControlKeyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"keyboard_control_key"} ref={ref}/>
});

KeyboardControlKeyIcon.displayName = "KeyboardControlKeyIcon";
