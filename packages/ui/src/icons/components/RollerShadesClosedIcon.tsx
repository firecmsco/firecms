import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RollerShadesClosedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"roller_shades_closed"} ref={ref}/>
});

RollerShadesClosedIcon.displayName = "RollerShadesClosedIcon";
