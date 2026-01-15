import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WooCommerceIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"woo_commerce"} ref={ref}/>
});

WooCommerceIcon.displayName = "WooCommerceIcon";
