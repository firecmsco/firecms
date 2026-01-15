import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WidgetsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"widgets"} ref={ref}/>
});

WidgetsIcon.displayName = "WidgetsIcon";
