import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SearchOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"search_off"} ref={ref}/>
});

SearchOffIcon.displayName = "SearchOffIcon";
