import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BluetoothSearchingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bluetooth_searching"} ref={ref}/>
});

BluetoothSearchingIcon.displayName = "BluetoothSearchingIcon";
