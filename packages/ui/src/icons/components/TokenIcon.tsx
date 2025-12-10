import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TokenIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"token"} ref={ref}/>
});

TokenIcon.displayName = "TokenIcon";
