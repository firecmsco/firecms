import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ProductionQuantityLimitsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"production_quantity_limits"} ref={ref}/>
});

ProductionQuantityLimitsIcon.displayName = "ProductionQuantityLimitsIcon";
