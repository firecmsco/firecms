import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ManageHistoryIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"manage_history"} ref={ref}/>
});

ManageHistoryIcon.displayName = "ManageHistoryIcon";
