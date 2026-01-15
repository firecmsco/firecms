import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ArrowLeftIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"arrow_left"} ref={ref}/>
});

ArrowLeftIcon.displayName = "ArrowLeftIcon";
