import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MonetizationOnIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"monetization_on"} ref={ref}/>
});

MonetizationOnIcon.displayName = "MonetizationOnIcon";
