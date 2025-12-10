import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SortIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sort"} ref={ref}/>
});

SortIcon.displayName = "SortIcon";
