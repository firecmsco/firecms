import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SortByAlphaIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sort_by_alpha"} ref={ref}/>
});

SortByAlphaIcon.displayName = "SortByAlphaIcon";
