import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DoNotDisturbOnIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"do_not_disturb_on"} ref={ref}/>
});

DoNotDisturbOnIcon.displayName = "DoNotDisturbOnIcon";
