import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ViewKanbanIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"view_kanban"} ref={ref}/>
});

ViewKanbanIcon.displayName = "ViewKanbanIcon";
