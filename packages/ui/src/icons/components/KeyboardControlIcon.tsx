import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const KeyboardControlIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"keyboard_control"} ref={ref}/>
});

KeyboardControlIcon.displayName = "KeyboardControlIcon";
