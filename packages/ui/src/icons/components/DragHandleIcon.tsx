import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DragHandleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"drag_handle"} ref={ref}/>
});

DragHandleIcon.displayName = "DragHandleIcon";
