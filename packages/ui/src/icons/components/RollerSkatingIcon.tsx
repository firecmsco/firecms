import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RollerSkatingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"roller_skating"} ref={ref}/>
});

RollerSkatingIcon.displayName = "RollerSkatingIcon";
