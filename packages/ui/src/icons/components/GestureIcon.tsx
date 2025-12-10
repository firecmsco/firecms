import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GestureIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"gesture"} ref={ref}/>
});

GestureIcon.displayName = "GestureIcon";
