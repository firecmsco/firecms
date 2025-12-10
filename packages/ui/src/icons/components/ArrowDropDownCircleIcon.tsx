import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ArrowDropDownCircleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"arrow_drop_down_circle"} ref={ref}/>
});

ArrowDropDownCircleIcon.displayName = "ArrowDropDownCircleIcon";
