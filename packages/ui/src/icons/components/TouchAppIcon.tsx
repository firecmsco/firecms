import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TouchAppIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"touch_app"} ref={ref}/>
});

TouchAppIcon.displayName = "TouchAppIcon";
