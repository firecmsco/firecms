import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RepeatOnIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"repeat_on"} ref={ref}/>
});

RepeatOnIcon.displayName = "RepeatOnIcon";
