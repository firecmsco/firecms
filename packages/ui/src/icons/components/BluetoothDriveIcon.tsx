import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BluetoothDriveIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bluetooth_drive"} ref={ref}/>
});

BluetoothDriveIcon.displayName = "BluetoothDriveIcon";
