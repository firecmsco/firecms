import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StorefrontIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"storefront"} ref={ref}/>
});

StorefrontIcon.displayName = "StorefrontIcon";
