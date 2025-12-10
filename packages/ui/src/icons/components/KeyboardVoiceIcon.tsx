import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const KeyboardVoiceIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"keyboard_voice"} ref={ref}/>
});

KeyboardVoiceIcon.displayName = "KeyboardVoiceIcon";
