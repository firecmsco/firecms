import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SpeakerNotesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"speaker_notes"} ref={ref}/>
});

SpeakerNotesIcon.displayName = "SpeakerNotesIcon";
