import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PriceChangeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"price_change"} ref={ref}/>
});

PriceChangeIcon.displayName = "PriceChangeIcon";
