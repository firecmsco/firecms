import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RefreshIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"refresh"} ref={ref}/>
});

RefreshIcon.displayName = "RefreshIcon";
