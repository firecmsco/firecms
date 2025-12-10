import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ArrowCircleLeftIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"arrow_circle_left"} ref={ref}/>
});

ArrowCircleLeftIcon.displayName = "ArrowCircleLeftIcon";
