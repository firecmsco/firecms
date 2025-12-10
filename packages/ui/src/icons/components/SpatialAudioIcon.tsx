import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SpatialAudioIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"spatial_audio"} ref={ref}/>
});

SpatialAudioIcon.displayName = "SpatialAudioIcon";
