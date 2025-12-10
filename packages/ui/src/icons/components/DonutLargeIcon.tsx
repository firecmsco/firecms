import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DonutLargeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"donut_large"} ref={ref}/>
});

DonutLargeIcon.displayName = "DonutLargeIcon";
