import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WindowIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"window"} ref={ref}/>
});

WindowIcon.displayName = "WindowIcon";
