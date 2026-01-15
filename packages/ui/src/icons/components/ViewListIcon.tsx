import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ViewListIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"view_list"} ref={ref}/>
});

ViewListIcon.displayName = "ViewListIcon";
