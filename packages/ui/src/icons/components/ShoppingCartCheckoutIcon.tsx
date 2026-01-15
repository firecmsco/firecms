import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ShoppingCartCheckoutIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"shopping_cart_checkout"} ref={ref}/>
});

ShoppingCartCheckoutIcon.displayName = "ShoppingCartCheckoutIcon";
