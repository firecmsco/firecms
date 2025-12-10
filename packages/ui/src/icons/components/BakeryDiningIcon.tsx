import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BakeryDiningIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bakery_dining"} ref={ref}/>
});

BakeryDiningIcon.displayName = "BakeryDiningIcon";
