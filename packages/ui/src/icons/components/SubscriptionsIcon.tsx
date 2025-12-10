import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SubscriptionsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"subscriptions"} ref={ref}/>
});

SubscriptionsIcon.displayName = "SubscriptionsIcon";
