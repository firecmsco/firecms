import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SpeakerPhoneIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"speaker_phone"} ref={ref}/>
});

SpeakerPhoneIcon.displayName = "SpeakerPhoneIcon";
