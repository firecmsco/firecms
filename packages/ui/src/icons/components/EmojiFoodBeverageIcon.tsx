import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EmojiFoodBeverageIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"emoji_food_beverage"} ref={ref}/>
});

EmojiFoodBeverageIcon.displayName = "EmojiFoodBeverageIcon";
