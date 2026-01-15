import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NowWidgetsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"now_widgets"} ref={ref}/>
});

NowWidgetsIcon.displayName = "NowWidgetsIcon";
