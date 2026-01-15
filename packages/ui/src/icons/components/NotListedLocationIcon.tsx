import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NotListedLocationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"not_listed_location"} ref={ref}/>
});

NotListedLocationIcon.displayName = "NotListedLocationIcon";
