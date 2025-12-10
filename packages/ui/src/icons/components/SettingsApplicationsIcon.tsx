import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SettingsApplicationsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"settings_applications"} ref={ref}/>
});

SettingsApplicationsIcon.displayName = "SettingsApplicationsIcon";
