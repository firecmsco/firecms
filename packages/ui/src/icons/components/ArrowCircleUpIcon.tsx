import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ArrowCircleUpIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"arrow_circle_up"} ref={ref}/>
});

ArrowCircleUpIcon.displayName = "ArrowCircleUpIcon";
