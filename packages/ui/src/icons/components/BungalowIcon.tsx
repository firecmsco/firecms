import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BungalowIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bungalow"} ref={ref}/>
});

BungalowIcon.displayName = "BungalowIcon";
