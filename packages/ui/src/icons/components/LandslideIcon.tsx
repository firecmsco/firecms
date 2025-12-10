import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LandslideIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"landslide"} ref={ref}/>
});

LandslideIcon.displayName = "LandslideIcon";
