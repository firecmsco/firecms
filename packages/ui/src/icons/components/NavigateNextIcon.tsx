import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NavigateNextIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"navigate_next"} ref={ref}/>
});

NavigateNextIcon.displayName = "NavigateNextIcon";
