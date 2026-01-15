import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DoDisturbIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"do_disturb"} ref={ref}/>
});

DoDisturbIcon.displayName = "DoDisturbIcon";
