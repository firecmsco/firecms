import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StraightIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"straight"} ref={ref}/>
});

StraightIcon.displayName = "StraightIcon";
