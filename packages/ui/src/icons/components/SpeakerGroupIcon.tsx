import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SpeakerGroupIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"speaker_group"} ref={ref}/>
});

SpeakerGroupIcon.displayName = "SpeakerGroupIcon";
