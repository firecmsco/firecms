import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BluetoothConnectedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bluetooth_connected"} ref={ref}/>
});

BluetoothConnectedIcon.displayName = "BluetoothConnectedIcon";
