import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocalGroceryStoreIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"local_grocery_store"} ref={ref}/>
});

LocalGroceryStoreIcon.displayName = "LocalGroceryStoreIcon";
