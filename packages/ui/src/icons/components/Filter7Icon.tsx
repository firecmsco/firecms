import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Filter7Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"filter_7"} ref={ref}/>
});

Filter7Icon.displayName = "Filter7Icon";
