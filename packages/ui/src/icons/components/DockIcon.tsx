import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DockIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"dock"} ref={ref}/>
});

DockIcon.displayName = "DockIcon";
