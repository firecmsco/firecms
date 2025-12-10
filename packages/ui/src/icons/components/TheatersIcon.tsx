import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TheatersIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"theaters"} ref={ref}/>
});

TheatersIcon.displayName = "TheatersIcon";
