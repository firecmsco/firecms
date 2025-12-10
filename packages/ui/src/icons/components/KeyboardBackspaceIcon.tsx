import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const KeyboardBackspaceIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"keyboard_backspace"} ref={ref}/>
});

KeyboardBackspaceIcon.displayName = "KeyboardBackspaceIcon";
