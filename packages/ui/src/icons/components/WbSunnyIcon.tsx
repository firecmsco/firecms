import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WbSunnyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wb_sunny"} ref={ref}/>
});

WbSunnyIcon.displayName = "WbSunnyIcon";
