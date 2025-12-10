import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Inventory2Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"inventory_2"} ref={ref}/>
});

Inventory2Icon.displayName = "Inventory2Icon";
