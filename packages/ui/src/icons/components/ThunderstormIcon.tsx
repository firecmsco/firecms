import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ThunderstormIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"thunderstorm"} ref={ref}/>
});

ThunderstormIcon.displayName = "ThunderstormIcon";
