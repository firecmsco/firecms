import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PriceCheckIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"price_check"} ref={ref}/>
});

PriceCheckIcon.displayName = "PriceCheckIcon";
