import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AddShoppingCartIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"add_shopping_cart"} ref={ref}/>
});

AddShoppingCartIcon.displayName = "AddShoppingCartIcon";
