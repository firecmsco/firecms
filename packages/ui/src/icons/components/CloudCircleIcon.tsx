import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CloudCircleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"cloud_circle"} ref={ref}/>
});

CloudCircleIcon.displayName = "CloudCircleIcon";
