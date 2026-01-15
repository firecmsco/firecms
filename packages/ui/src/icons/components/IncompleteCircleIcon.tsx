import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const IncompleteCircleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"incomplete_circle"} ref={ref}/>
});

IncompleteCircleIcon.displayName = "IncompleteCircleIcon";
