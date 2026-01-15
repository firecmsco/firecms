import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CardMembershipIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"card_membership"} ref={ref}/>
});

CardMembershipIcon.displayName = "CardMembershipIcon";
