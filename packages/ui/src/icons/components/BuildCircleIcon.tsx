import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BuildCircleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"build_circle"} ref={ref}/>
});

BuildCircleIcon.displayName = "BuildCircleIcon";
