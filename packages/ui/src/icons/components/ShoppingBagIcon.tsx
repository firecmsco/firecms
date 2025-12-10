import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ShoppingBagIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"shopping_bag"} ref={ref}/>
});

ShoppingBagIcon.displayName = "ShoppingBagIcon";
