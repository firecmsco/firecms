import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ShoppingCartIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"shopping_cart"} ref={ref}/>
});

ShoppingCartIcon.displayName = "ShoppingCartIcon";
