import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RemoveIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"remove"} ref={ref}/>
});

RemoveIcon.displayName = "RemoveIcon";
