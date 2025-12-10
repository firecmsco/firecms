import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RingVolumeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"ring_volume"} ref={ref}/>
});

RingVolumeIcon.displayName = "RingVolumeIcon";
