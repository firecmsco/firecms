import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PaymentsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"payments"} ref={ref}/>
});

PaymentsIcon.displayName = "PaymentsIcon";
