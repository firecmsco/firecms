import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NotesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"notes"} ref={ref}/>
});

NotesIcon.displayName = "NotesIcon";
