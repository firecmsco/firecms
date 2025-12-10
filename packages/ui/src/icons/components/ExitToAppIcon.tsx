import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ExitToAppIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"exit_to_app"} ref={ref}/>
});

ExitToAppIcon.displayName = "ExitToAppIcon";
