import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocalPoliceIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"local_police"} ref={ref}/>
});

LocalPoliceIcon.displayName = "LocalPoliceIcon";
