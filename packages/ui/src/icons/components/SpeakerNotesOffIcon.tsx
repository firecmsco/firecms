import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SpeakerNotesOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"speaker_notes_off"} ref={ref}/>
});

SpeakerNotesOffIcon.displayName = "SpeakerNotesOffIcon";
