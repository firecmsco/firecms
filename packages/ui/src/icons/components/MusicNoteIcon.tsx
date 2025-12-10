import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MusicNoteIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"music_note"} ref={ref}/>
});

MusicNoteIcon.displayName = "MusicNoteIcon";
