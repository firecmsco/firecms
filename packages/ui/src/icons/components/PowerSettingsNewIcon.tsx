import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PowerSettingsNewIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"power_settings_new"} ref={ref}/>
});

PowerSettingsNewIcon.displayName = "PowerSettingsNewIcon";
