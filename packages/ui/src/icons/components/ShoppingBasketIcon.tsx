import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ShoppingBasketIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"shopping_basket"} ref={ref}/>
});

ShoppingBasketIcon.displayName = "ShoppingBasketIcon";
