import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocalDrinkIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"local_drink"} ref={ref}/>
});

LocalDrinkIcon.displayName = "LocalDrinkIcon";
