import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WarehouseIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"warehouse"} ref={ref}/>
});

WarehouseIcon.displayName = "WarehouseIcon";
