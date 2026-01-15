import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WorkOutlineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"work_outline"} ref={ref}/>
});

WorkOutlineIcon.displayName = "WorkOutlineIcon";
