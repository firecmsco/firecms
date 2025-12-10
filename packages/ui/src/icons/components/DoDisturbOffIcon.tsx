import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DoDisturbOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"do_disturb_off"} ref={ref}/>
});

DoDisturbOffIcon.displayName = "DoDisturbOffIcon";
