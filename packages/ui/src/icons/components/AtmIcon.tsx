import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AtmIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"atm"} ref={ref}/>
});

AtmIcon.displayName = "AtmIcon";
