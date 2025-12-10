import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DiscountIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"discount"} ref={ref}/>
});

DiscountIcon.displayName = "DiscountIcon";
