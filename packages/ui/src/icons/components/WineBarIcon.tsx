import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WineBarIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wine_bar"} ref={ref}/>
});

WineBarIcon.displayName = "WineBarIcon";
