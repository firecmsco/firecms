import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SettingsPhoneIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"settings_phone"} ref={ref}/>
});

SettingsPhoneIcon.displayName = "SettingsPhoneIcon";
