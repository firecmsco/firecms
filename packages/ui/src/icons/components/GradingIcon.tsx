import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GradingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"grading"} ref={ref}/>
});

GradingIcon.displayName = "GradingIcon";
