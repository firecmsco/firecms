import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SettingsSystemDaydreamIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"settings_system_daydream"} ref={ref}/>
});

SettingsSystemDaydreamIcon.displayName = "SettingsSystemDaydreamIcon";
