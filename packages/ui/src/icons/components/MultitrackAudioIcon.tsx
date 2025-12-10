import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MultitrackAudioIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"multitrack_audio"} ref={ref}/>
});

MultitrackAudioIcon.displayName = "MultitrackAudioIcon";
