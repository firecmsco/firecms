import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Filter5Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"filter_5"} ref={ref}/>
});

Filter5Icon.displayName = "Filter5Icon";
