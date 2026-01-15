import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HistoryEduIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"history_edu"} ref={ref}/>
});

HistoryEduIcon.displayName = "HistoryEduIcon";
