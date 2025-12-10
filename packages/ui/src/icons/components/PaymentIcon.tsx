import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PaymentIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"payment"} ref={ref}/>
});

PaymentIcon.displayName = "PaymentIcon";
