import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CreditCardIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"credit_card"} ref={ref}/>
});

CreditCardIcon.displayName = "CreditCardIcon";
