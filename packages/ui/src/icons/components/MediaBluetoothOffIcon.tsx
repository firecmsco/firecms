import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MediaBluetoothOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"media_bluetooth_off"} ref={ref}/>
});

MediaBluetoothOffIcon.displayName = "MediaBluetoothOffIcon";
