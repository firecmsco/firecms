import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ArrowRightIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"arrow_right"} ref={ref}/>
});

ArrowRightIcon.displayName = "ArrowRightIcon";
