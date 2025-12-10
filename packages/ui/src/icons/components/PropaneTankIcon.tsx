import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PropaneTankIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"propane_tank"} ref={ref}/>
});

PropaneTankIcon.displayName = "PropaneTankIcon";
