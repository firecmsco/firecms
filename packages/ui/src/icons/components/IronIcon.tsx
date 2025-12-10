import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const IronIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"iron"} ref={ref}/>
});

IronIcon.displayName = "IronIcon";
