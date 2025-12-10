import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SettingsDisplayIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"settings_display"} ref={ref}/>
});

SettingsDisplayIcon.displayName = "SettingsDisplayIcon";
