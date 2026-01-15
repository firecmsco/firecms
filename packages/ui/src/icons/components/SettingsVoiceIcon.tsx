import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SettingsVoiceIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"settings_voice"} ref={ref}/>
});

SettingsVoiceIcon.displayName = "SettingsVoiceIcon";
