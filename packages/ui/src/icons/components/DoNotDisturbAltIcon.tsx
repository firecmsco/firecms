import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DoNotDisturbAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"do_not_disturb_alt"} ref={ref}/>
});

DoNotDisturbAltIcon.displayName = "DoNotDisturbAltIcon";
