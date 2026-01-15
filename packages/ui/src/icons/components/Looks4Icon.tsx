import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Looks4Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"looks_4"} ref={ref}/>
});

Looks4Icon.displayName = "Looks4Icon";
