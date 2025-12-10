import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const KeyboardReturnIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"keyboard_return"} ref={ref}/>
});

KeyboardReturnIcon.displayName = "KeyboardReturnIcon";
