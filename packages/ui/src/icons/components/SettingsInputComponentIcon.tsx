import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SettingsInputComponentIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"settings_input_component"} ref={ref}/>
});

SettingsInputComponentIcon.displayName = "SettingsInputComponentIcon";
