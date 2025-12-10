import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RunCircleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"run_circle"} ref={ref}/>
});

RunCircleIcon.displayName = "RunCircleIcon";
