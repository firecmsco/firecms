import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HistoryToggleOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"history_toggle_off"} ref={ref}/>
});

HistoryToggleOffIcon.displayName = "HistoryToggleOffIcon";
