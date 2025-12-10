import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LoyaltyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"loyalty"} ref={ref}/>
});

LoyaltyIcon.displayName = "LoyaltyIcon";
