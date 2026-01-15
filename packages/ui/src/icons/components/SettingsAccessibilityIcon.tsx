import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SettingsAccessibilityIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"settings_accessibility"} ref={ref}/>
});

SettingsAccessibilityIcon.displayName = "SettingsAccessibilityIcon";
