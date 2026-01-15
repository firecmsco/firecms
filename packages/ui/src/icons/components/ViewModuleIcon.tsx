import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ViewModuleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"view_module"} ref={ref}/>
});

ViewModuleIcon.displayName = "ViewModuleIcon";
