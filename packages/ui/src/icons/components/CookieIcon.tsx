import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CookieIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"cookie"} ref={ref}/>
});

CookieIcon.displayName = "CookieIcon";
