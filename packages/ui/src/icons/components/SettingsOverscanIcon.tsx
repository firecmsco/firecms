import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SettingsOverscanIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"settings_overscan"} ref={ref}/>
});

SettingsOverscanIcon.displayName = "SettingsOverscanIcon";
