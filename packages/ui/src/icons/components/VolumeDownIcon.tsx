import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VolumeDownIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"volume_down"} ref={ref}/>
});

VolumeDownIcon.displayName = "VolumeDownIcon";
