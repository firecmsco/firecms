import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const KeyboardTabIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"keyboard_tab"} ref={ref}/>
});

KeyboardTabIcon.displayName = "KeyboardTabIcon";
