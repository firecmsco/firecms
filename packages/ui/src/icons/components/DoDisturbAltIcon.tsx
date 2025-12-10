import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DoDisturbAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"do_disturb_alt"} ref={ref}/>
});

DoDisturbAltIcon.displayName = "DoDisturbAltIcon";
