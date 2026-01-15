import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const KeyOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"key_off"} ref={ref}/>
});

KeyOffIcon.displayName = "KeyOffIcon";
