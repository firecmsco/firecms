import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PentagonIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"pentagon"} ref={ref}/>
});

PentagonIcon.displayName = "PentagonIcon";
