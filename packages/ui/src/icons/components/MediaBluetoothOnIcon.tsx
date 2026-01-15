import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MediaBluetoothOnIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"media_bluetooth_on"} ref={ref}/>
});

MediaBluetoothOnIcon.displayName = "MediaBluetoothOnIcon";
