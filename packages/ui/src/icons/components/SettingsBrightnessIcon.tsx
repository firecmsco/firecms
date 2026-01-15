import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SettingsBrightnessIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"settings_brightness"} ref={ref}/>
});

SettingsBrightnessIcon.displayName = "SettingsBrightnessIcon";
