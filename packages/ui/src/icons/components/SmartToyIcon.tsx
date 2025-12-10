import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SmartToyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"smart_toy"} ref={ref}/>
});

SmartToyIcon.displayName = "SmartToyIcon";
