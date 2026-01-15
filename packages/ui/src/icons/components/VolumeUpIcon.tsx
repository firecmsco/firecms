import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VolumeUpIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"volume_up"} ref={ref}/>
});

VolumeUpIcon.displayName = "VolumeUpIcon";
