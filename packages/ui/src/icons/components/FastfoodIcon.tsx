import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FastfoodIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"fastfood"} ref={ref}/>
});

FastfoodIcon.displayName = "FastfoodIcon";
