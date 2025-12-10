import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CoffeeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"coffee"} ref={ref}/>
});

CoffeeIcon.displayName = "CoffeeIcon";
