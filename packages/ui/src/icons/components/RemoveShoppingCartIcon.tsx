import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RemoveShoppingCartIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"remove_shopping_cart"} ref={ref}/>
});

RemoveShoppingCartIcon.displayName = "RemoveShoppingCartIcon";
