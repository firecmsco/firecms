import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RotateLeftIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"rotate_left"} ref={ref}/>
});

RotateLeftIcon.displayName = "RotateLeftIcon";
