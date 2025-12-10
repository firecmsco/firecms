import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ExpandLessIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"expand_less"} ref={ref}/>
});

ExpandLessIcon.displayName = "ExpandLessIcon";
