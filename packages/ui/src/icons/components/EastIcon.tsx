import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EastIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"east"} ref={ref}/>
});

EastIcon.displayName = "EastIcon";
