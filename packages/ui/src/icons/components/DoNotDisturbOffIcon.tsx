import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DoNotDisturbOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"do_not_disturb_off"} ref={ref}/>
});

DoNotDisturbOffIcon.displayName = "DoNotDisturbOffIcon";
