import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ChecklistIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"checklist"} ref={ref}/>
});

ChecklistIcon.displayName = "ChecklistIcon";
