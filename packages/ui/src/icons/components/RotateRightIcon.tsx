import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RotateRightIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"rotate_right"} ref={ref}/>
});

RotateRightIcon.displayName = "RotateRightIcon";
