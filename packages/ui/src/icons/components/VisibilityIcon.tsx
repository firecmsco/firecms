import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VisibilityIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"visibility"} ref={ref}/>
});

VisibilityIcon.displayName = "VisibilityIcon";
