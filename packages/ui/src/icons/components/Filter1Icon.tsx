import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Filter1Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"filter_1"} ref={ref}/>
});

Filter1Icon.displayName = "Filter1Icon";
