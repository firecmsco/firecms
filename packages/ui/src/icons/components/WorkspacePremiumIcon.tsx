import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WorkspacePremiumIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"workspace_premium"} ref={ref}/>
});

WorkspacePremiumIcon.displayName = "WorkspacePremiumIcon";
