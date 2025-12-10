import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VolumeOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"volume_off"} ref={ref}/>
});

VolumeOffIcon.displayName = "VolumeOffIcon";
