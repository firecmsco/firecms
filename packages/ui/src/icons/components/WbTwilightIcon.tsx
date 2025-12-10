import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WbTwilightIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wb_twilight"} ref={ref}/>
});

WbTwilightIcon.displayName = "WbTwilightIcon";
