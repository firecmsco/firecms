import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FilterListIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"filter_list"} ref={ref}/>
});

FilterListIcon.displayName = "FilterListIcon";
