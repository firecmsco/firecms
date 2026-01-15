import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FireTruckIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"fire_truck"} ref={ref}/>
});

FireTruckIcon.displayName = "FireTruckIcon";
