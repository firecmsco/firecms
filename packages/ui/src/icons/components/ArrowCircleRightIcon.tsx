import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ArrowCircleRightIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"arrow_circle_right"} ref={ref}/>
});

ArrowCircleRightIcon.displayName = "ArrowCircleRightIcon";
