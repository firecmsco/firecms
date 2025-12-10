import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DoDisturbOnIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"do_disturb_on"} ref={ref}/>
});

DoDisturbOnIcon.displayName = "DoDisturbOnIcon";
