import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ArrowDropUpIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"arrow_drop_up"} ref={ref}/>
});

ArrowDropUpIcon.displayName = "ArrowDropUpIcon";
