import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Looks3Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"looks_3"} ref={ref}/>
});

Looks3Icon.displayName = "Looks3Icon";
