import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Shop2Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"shop_2"} ref={ref}/>
});

Shop2Icon.displayName = "Shop2Icon";
