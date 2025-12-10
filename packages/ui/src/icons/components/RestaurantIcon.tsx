import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RestaurantIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"restaurant"} ref={ref}/>
});

RestaurantIcon.displayName = "RestaurantIcon";
