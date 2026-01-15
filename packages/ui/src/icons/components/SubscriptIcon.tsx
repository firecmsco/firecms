import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SubscriptIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"subscript"} ref={ref}/>
});

SubscriptIcon.displayName = "SubscriptIcon";
