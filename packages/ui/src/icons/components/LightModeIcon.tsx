import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LightModeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"light_mode"} ref={ref}/>
});

LightModeIcon.displayName = "LightModeIcon";
