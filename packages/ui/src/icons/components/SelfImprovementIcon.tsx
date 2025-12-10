import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SelfImprovementIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"self_improvement"} ref={ref}/>
});

SelfImprovementIcon.displayName = "SelfImprovementIcon";
