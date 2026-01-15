import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BluetoothDisabledIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bluetooth_disabled"} ref={ref}/>
});

BluetoothDisabledIcon.displayName = "BluetoothDisabledIcon";
