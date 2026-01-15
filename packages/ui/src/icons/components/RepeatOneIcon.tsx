import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RepeatOneIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"repeat_one"} ref={ref}/>
});

RepeatOneIcon.displayName = "RepeatOneIcon";
