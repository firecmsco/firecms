import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EmergencyRecordingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"emergency_recording"} ref={ref}/>
});

EmergencyRecordingIcon.displayName = "EmergencyRecordingIcon";
