import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CastConnectedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"cast_connected"} ref={ref}/>
});

CastConnectedIcon.displayName = "CastConnectedIcon";
