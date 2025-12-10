import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ArrowCircleDownIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"arrow_circle_down"} ref={ref}/>
});

ArrowCircleDownIcon.displayName = "ArrowCircleDownIcon";
