import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AdminPanelSettingsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"admin_panel_settings"} ref={ref}/>
});

AdminPanelSettingsIcon.displayName = "AdminPanelSettingsIcon";
