import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SettingsBluetoothIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"settings_bluetooth"} ref={ref}/>
});

SettingsBluetoothIcon.displayName = "SettingsBluetoothIcon";
