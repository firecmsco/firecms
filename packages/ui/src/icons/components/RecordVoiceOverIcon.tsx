import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RecordVoiceOverIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"record_voice_over"} ref={ref}/>
});

RecordVoiceOverIcon.displayName = "RecordVoiceOverIcon";
