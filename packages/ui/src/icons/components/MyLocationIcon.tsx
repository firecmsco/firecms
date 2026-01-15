import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MyLocationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"my_location"} ref={ref}/>
});

MyLocationIcon.displayName = "MyLocationIcon";
