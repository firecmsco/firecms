import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BluetoothIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bluetooth"} ref={ref}/>
});

BluetoothIcon.displayName = "BluetoothIcon";
