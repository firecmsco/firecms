import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WifiIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wifi"} ref={ref}/>
});

WifiIcon.displayName = "WifiIcon";
