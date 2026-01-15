import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WorkspacesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"workspaces"} ref={ref}/>
});

WorkspacesIcon.displayName = "WorkspacesIcon";
