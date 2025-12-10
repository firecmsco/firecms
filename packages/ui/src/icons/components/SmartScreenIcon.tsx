import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SmartScreenIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"smart_screen"} ref={ref}/>
});

SmartScreenIcon.displayName = "SmartScreenIcon";
