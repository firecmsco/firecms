import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WrongLocationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wrong_location"} ref={ref}/>
});

WrongLocationIcon.displayName = "WrongLocationIcon";
