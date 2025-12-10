import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VolumeMuteIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"volume_mute"} ref={ref}/>
});

VolumeMuteIcon.displayName = "VolumeMuteIcon";
