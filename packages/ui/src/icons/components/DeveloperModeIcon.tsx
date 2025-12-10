import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DeveloperModeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"developer_mode"} ref={ref}/>
});

DeveloperModeIcon.displayName = "DeveloperModeIcon";
