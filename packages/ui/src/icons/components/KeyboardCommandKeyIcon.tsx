import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const KeyboardCommandKeyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"keyboard_command_key"} ref={ref}/>
});

KeyboardCommandKeyIcon.displayName = "KeyboardCommandKeyIcon";
