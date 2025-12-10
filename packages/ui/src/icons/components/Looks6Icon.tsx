import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Looks6Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"looks_6"} ref={ref}/>
});

Looks6Icon.displayName = "Looks6Icon";
