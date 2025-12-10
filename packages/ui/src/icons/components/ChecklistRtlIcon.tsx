import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ChecklistRtlIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"checklist_rtl"} ref={ref}/>
});

ChecklistRtlIcon.displayName = "ChecklistRtlIcon";
