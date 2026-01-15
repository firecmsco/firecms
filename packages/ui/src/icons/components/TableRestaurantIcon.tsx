import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TableRestaurantIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"table_restaurant"} ref={ref}/>
});

TableRestaurantIcon.displayName = "TableRestaurantIcon";
