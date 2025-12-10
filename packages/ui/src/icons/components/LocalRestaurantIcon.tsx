import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocalRestaurantIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"local_restaurant"} ref={ref}/>
});

LocalRestaurantIcon.displayName = "LocalRestaurantIcon";
