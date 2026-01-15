import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocalAtmIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"local_atm"} ref={ref}/>
});

LocalAtmIcon.displayName = "LocalAtmIcon";
