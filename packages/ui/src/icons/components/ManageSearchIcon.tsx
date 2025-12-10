import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ManageSearchIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"manage_search"} ref={ref}/>
});

ManageSearchIcon.displayName = "ManageSearchIcon";
