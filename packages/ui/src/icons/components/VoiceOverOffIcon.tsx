import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VoiceOverOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"voice_over_off"} ref={ref}/>
});

VoiceOverOffIcon.displayName = "VoiceOverOffIcon";
