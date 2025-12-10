import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ChangeCircleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"change_circle"} ref={ref}/>
});

ChangeCircleIcon.displayName = "ChangeCircleIcon";
