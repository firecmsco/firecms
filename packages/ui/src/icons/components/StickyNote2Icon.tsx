import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StickyNote2Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sticky_note_2"} ref={ref}/>
});

StickyNote2Icon.displayName = "StickyNote2Icon";
