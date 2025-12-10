import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FoodBankIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"food_bank"} ref={ref}/>
});

FoodBankIcon.displayName = "FoodBankIcon";
