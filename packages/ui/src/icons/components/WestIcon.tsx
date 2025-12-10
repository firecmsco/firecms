import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WestIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"west"} ref={ref}/>
});

WestIcon.displayName = "WestIcon";
