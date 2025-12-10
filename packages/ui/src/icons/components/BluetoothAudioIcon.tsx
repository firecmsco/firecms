import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BluetoothAudioIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bluetooth_audio"} ref={ref}/>
});

BluetoothAudioIcon.displayName = "BluetoothAudioIcon";
