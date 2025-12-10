import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SettingsRemoteIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"settings_remote"} ref={ref}/>
});

SettingsRemoteIcon.displayName = "SettingsRemoteIcon";
