import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ArrowForwardIosIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"arrow_forward_ios"} ref={ref}/>
});

ArrowForwardIosIcon.displayName = "ArrowForwardIosIcon";
