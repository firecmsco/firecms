import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RepeatOneOnIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"repeat_one_on"} ref={ref}/>
});

RepeatOneOnIcon.displayName = "RepeatOneOnIcon";
