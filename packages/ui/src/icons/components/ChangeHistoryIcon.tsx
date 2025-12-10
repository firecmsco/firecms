import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ChangeHistoryIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"change_history"} ref={ref}/>
});

ChangeHistoryIcon.displayName = "ChangeHistoryIcon";
