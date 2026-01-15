import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Filter4Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"filter_4"} ref={ref}/>
});

Filter4Icon.displayName = "Filter4Icon";
