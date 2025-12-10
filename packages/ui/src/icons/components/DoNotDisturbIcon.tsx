import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DoNotDisturbIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"do_not_disturb"} ref={ref}/>
});

DoNotDisturbIcon.displayName = "DoNotDisturbIcon";
