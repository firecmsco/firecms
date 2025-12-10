import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ViewSidebarIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"view_sidebar"} ref={ref}/>
});

ViewSidebarIcon.displayName = "ViewSidebarIcon";
