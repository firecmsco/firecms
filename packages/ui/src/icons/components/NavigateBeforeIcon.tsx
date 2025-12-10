import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NavigateBeforeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"navigate_before"} ref={ref}/>
});

NavigateBeforeIcon.displayName = "NavigateBeforeIcon";
