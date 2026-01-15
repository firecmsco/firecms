import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SoupKitchenIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"soup_kitchen"} ref={ref}/>
});

SoupKitchenIcon.displayName = "SoupKitchenIcon";
