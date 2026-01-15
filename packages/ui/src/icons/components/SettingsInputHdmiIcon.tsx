import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SettingsInputHdmiIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"settings_input_hdmi"} ref={ref}/>
});

SettingsInputHdmiIcon.displayName = "SettingsInputHdmiIcon";
