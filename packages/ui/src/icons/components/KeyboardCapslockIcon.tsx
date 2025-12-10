import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const KeyboardCapslockIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"keyboard_capslock"} ref={ref}/>
});

KeyboardCapslockIcon.displayName = "KeyboardCapslockIcon";
