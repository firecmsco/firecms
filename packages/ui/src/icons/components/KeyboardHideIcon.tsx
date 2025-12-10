import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const KeyboardHideIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"keyboard_hide"} ref={ref}/>
});

KeyboardHideIcon.displayName = "KeyboardHideIcon";
