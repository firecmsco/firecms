import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FilterVintageIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"filter_vintage"} ref={ref}/>
});

FilterVintageIcon.displayName = "FilterVintageIcon";
