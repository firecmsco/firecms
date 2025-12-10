import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SearchIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"search"} ref={ref}/>
});

SearchIcon.displayName = "SearchIcon";
