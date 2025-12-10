import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AutoModeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"auto_mode"} ref={ref}/>
});

AutoModeIcon.displayName = "AutoModeIcon";
