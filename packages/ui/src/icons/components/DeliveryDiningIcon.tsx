import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DeliveryDiningIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"delivery_dining"} ref={ref}/>
});

DeliveryDiningIcon.displayName = "DeliveryDiningIcon";
