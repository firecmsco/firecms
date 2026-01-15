import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocalShippingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"local_shipping"} ref={ref}/>
});

LocalShippingIcon.displayName = "LocalShippingIcon";
