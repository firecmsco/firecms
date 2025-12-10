import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DarkModeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"dark_mode"} ref={ref}/>
});

DarkModeIcon.displayName = "DarkModeIcon";
