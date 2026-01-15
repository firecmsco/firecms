import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SpeakerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"speaker"} ref={ref}/>
});

SpeakerIcon.displayName = "SpeakerIcon";
