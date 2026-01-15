import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VoiceChatIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"voice_chat"} ref={ref}/>
});

VoiceChatIcon.displayName = "VoiceChatIcon";
