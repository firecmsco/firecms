import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SpatialAudioOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"spatial_audio_off"} ref={ref}/>
});

SpatialAudioOffIcon.displayName = "SpatialAudioOffIcon";
