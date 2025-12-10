import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NoTransferIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"no_transfer"} ref={ref}/>
});

NoTransferIcon.displayName = "NoTransferIcon";
