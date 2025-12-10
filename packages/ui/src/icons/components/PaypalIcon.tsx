import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PaypalIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"paypal"} ref={ref}/>
});

PaypalIcon.displayName = "PaypalIcon";
