import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const KeyboardOptionKeyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"keyboard_option_key"} ref={ref}/>
});

KeyboardOptionKeyIcon.displayName = "KeyboardOptionKeyIcon";
