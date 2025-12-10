import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CoffeeMakerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"coffee_maker"} ref={ref}/>
});

CoffeeMakerIcon.displayName = "CoffeeMakerIcon";
