import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PhoneBluetoothSpeakerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"phone_bluetooth_speaker"} ref={ref}/>
});

PhoneBluetoothSpeakerIcon.displayName = "PhoneBluetoothSpeakerIcon";
