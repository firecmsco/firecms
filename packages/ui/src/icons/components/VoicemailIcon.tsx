import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VoicemailIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"voicemail"} ref={ref}/>
});

VoicemailIcon.displayName = "VoicemailIcon";
