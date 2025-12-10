import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VisibilityOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"visibility_off"} ref={ref}/>
});

VisibilityOffIcon.displayName = "VisibilityOffIcon";
