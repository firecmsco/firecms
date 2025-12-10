import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RedeemIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"redeem"} ref={ref}/>
});

RedeemIcon.displayName = "RedeemIcon";
