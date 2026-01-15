import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RollerShadesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"roller_shades"} ref={ref}/>
});

RollerShadesIcon.displayName = "RollerShadesIcon";
