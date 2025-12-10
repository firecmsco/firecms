import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ShopTwoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"shop_two"} ref={ref}/>
});

ShopTwoIcon.displayName = "ShopTwoIcon";
