import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AppSettingsAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"app_settings_alt"} ref={ref}/>
});

AppSettingsAltIcon.displayName = "AppSettingsAltIcon";
