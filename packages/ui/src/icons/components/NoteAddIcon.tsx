import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NoteAddIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"note_add"} ref={ref}/>
});

NoteAddIcon.displayName = "NoteAddIcon";
