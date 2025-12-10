import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RestartAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"restart_alt"} ref={ref}/>
});

RestartAltIcon.displayName = "RestartAltIcon";
