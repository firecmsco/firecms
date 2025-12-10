import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VignetteIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"vignette"} ref={ref}/>
});

VignetteIcon.displayName = "VignetteIcon";
