import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DragIndicatorIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"drag_indicator"} ref={ref}/>
});

DragIndicatorIcon.displayName = "DragIndicatorIcon";
