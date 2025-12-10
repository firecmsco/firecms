import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PointOfSaleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"point_of_sale"} ref={ref}/>
});

PointOfSaleIcon.displayName = "PointOfSaleIcon";
