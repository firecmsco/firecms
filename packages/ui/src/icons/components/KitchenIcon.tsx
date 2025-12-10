import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const KitchenIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"kitchen"} ref={ref}/>
});

KitchenIcon.displayName = "KitchenIcon";
