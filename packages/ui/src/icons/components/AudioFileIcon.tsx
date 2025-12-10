import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AudioFileIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"audio_file"} ref={ref}/>
});

AudioFileIcon.displayName = "AudioFileIcon";
