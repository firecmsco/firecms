import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ArrowForwardIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"arrow_forward"} ref={ref}/>
});

ArrowForwardIcon.displayName = "ArrowForwardIcon";
