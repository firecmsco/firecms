import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DonutSmallIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"donut_small"} ref={ref}/>
});

DonutSmallIcon.displayName = "DonutSmallIcon";
