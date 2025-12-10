import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DndForwardslashIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"dnd_forwardslash"} ref={ref}/>
});

DndForwardslashIcon.displayName = "DndForwardslashIcon";
