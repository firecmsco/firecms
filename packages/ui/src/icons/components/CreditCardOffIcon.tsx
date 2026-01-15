import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CreditCardOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"credit_card_off"} ref={ref}/>
});

CreditCardOffIcon.displayName = "CreditCardOffIcon";
