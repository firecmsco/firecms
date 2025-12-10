import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Filter3Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"filter_3"} ref={ref}/>
});

Filter3Icon.displayName = "Filter3Icon";
