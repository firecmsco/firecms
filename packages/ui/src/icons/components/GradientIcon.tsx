import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GradientIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"gradient"} ref={ref}/>
});

GradientIcon.displayName = "GradientIcon";
